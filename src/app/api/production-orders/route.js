import { db } from "@/lib/db";

// =========================
// GET - List all Production Orders
// =========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        po.id,
        po.order_number,
        po.order_qty,
        po.status,
        po.created_at,
        po.planned_start_date,
        po.planned_end_date,
        b.version AS bom_version,
        i.item_name AS fg_name,
        i.item_code AS fg_code,
        w.warehouse_name
      FROM production_orders po
      JOIN bom b ON po.bom_id = b.id
      JOIN items i ON po.fg_item_id = i.id
      JOIN warehouses w ON po.warehouse_id = w.id
      WHERE 1=1
    `;

    const params = [];
    if (status) {
      query += ` AND po.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (po.order_number LIKE ? OR i.item_name LIKE ? OR i.item_code LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY po.id DESC";

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (error) {
    console.error("❌ Production Orders GET Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// POST - Create Production Order
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      bom_id,
      fg_item_id,
      warehouse_id,
      order_qty,
      planned_start_date,
      planned_end_date,
      remarks,
    } = body;

    // ✅ Validation
    if (!bom_id || !fg_item_id || !warehouse_id || !order_qty || !planned_start_date) {
      return Response.json({ error: "❌ All required fields must be filled" }, { status: 400 });
    }

    if (isNaN(order_qty) || Number(order_qty) <= 0) {
      return Response.json({ error: "❌ Order quantity must be greater than 0" }, { status: 400 });
    }

    // ✅ Check BOM exists
    const [bomCheck] = await db.query(`SELECT id FROM bom WHERE id = ?`, [bom_id]);
    if (bomCheck.length === 0) {
      return Response.json({ error: "❌ Invalid BOM selected" }, { status: 400 });
    }

    // ✅ Check warehouse exists
    const [whCheck] = await db.query(`SELECT id FROM warehouses WHERE id = ?`, [warehouse_id]);
    if (whCheck.length === 0) {
      return Response.json({ error: "❌ Invalid warehouse selected" }, { status: 400 });
    }

    // ✅ Generate Order Number
    const order_number = `PO${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`;

    // ✅ Insert Order
    const [result] = await db.query(
      `INSERT INTO production_orders 
       (order_number, bom_id, fg_item_id, warehouse_id, order_qty, status, planned_start_date, planned_end_date, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, NOW())`,
      [order_number, bom_id, fg_item_id, warehouse_id, order_qty, planned_start_date, planned_end_date || null, remarks || null]
    );

    const production_order_id = result.insertId;

    // ✅ Auto add components from BOM
    const [components] = await db.query(
      `SELECT item_id, qty FROM bom_components WHERE bom_id = ?`,
      [bom_id]
    );

    for (const comp of components) {
      const planned_qty = comp.qty * order_qty;
      await db.query(
        `INSERT INTO production_order_items 
         (production_order_id, item_id, planned_qty, issued_qty) 
         VALUES (?, ?, ?, 0)`,
        [production_order_id, comp.item_id, planned_qty]
      );
    }

    return Response.json({
      message: "✅ Production Order created successfully",
      order_number,
      production_order_id,
    });
  } catch (error) {
    console.error("❌ Production Orders POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
