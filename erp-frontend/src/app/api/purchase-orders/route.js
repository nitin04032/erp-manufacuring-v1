import { db } from "@/lib/db";

// ✅ GET - All Purchase Orders
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT po.*, s.supplier_name, w.warehouse_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       JOIN warehouses w ON po.warehouse_id = w.id
       ORDER BY po.created_at DESC`
    );

    // Cast numeric fields to numbers
    const orders = rows.map((po) => ({
      ...po,
      subtotal: parseFloat(po.subtotal) || 0,
      discount_amount: parseFloat(po.discount_amount) || 0,
      tax_amount: parseFloat(po.tax_amount) || 0,
      total_amount: parseFloat(po.total_amount) || 0,
    }));

    return Response.json(orders);
  } catch (error) {
    console.error("❌ GET Orders Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - Create Purchase Order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      supplier_id,
      warehouse_id,
      po_date,
      expected_delivery_date,
      terms_and_conditions,
      remarks,
      status,
      subtotal,
      discount_amount,
      tax_amount,
      total_amount,
      items = [],
    } = body;

    // 🔹 Generate PO Number
    const [last] = await db.query(
      "SELECT po_number FROM purchase_orders ORDER BY id DESC LIMIT 1"
    );

    let newNumber = "PO001";
    if (last.length > 0 && last[0].po_number) {
      const num = parseInt(last[0].po_number.replace("PO", "")) + 1;
      newNumber = "PO" + num.toString().padStart(3, "0");
    }

    // 🔹 Insert Purchase Order
    const [result] = await db.query(
      `INSERT INTO purchase_orders 
       (po_number, supplier_id, warehouse_id, po_date, expected_delivery_date, terms_and_conditions, remarks, status, subtotal, discount_amount, tax_amount, total_amount, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newNumber,
        supplier_id,
        warehouse_id,
        po_date,
        expected_delivery_date,
        terms_and_conditions,
        remarks,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
      ]
    );

    const poId = result.insertId;

    // 🔹 Insert Items
    for (const item of items) {
      await db.query(
        `INSERT INTO purchase_order_items 
         (po_id, item_id, ordered_qty, unit_price, discount_percent, tax_percent, remarks, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          poId,
          item.item_id,
          item.ordered_qty,
          item.unit_price,
          item.discount_percent,
          item.tax_percent,
          item.remarks,
        ]
      );
    }

    return Response.json({
      message: "Purchase Order created successfully",
      id: poId,
      po_number: newNumber,
    });
  } catch (error) {
    console.error("❌ POST PO Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
