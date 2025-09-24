import { db } from "@/lib/db";

// =========================
// GET - Production Order Detail
// =========================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const [orderRows] = await db.query(
      `SELECT 
          po.id,
          po.order_number,
          po.order_qty,
          po.status,
          po.remarks,
          po.created_at,
          po.planned_start_date,
          po.planned_end_date,
          b.version AS bom_version,
          i.item_name AS fg_name,
          i.item_code AS fg_code,
          w.warehouse_name,
          po.warehouse_id
       FROM production_orders po
       JOIN bom b ON po.bom_id = b.id
       JOIN items i ON po.fg_item_id = i.id
       JOIN warehouses w ON po.warehouse_id = w.id
       WHERE po.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return Response.json({ error: "❌ Production Order not found" }, { status: 404 });
    }

    const order = orderRows[0];

    // Components
    const [compRows] = await db.query(
      `SELECT 
          poi.id,
          poi.item_id,
          poi.planned_qty,
          poi.issued_qty,
          i.item_code,
          i.item_name
       FROM production_order_items poi
       JOIN items i ON poi.item_id = i.id
       WHERE poi.production_order_id = ?`,
      [id]
    );

    order.components = compRows;

    return Response.json(order);
  } catch (error) {
    console.error("❌ Production Order Detail Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// PUT - Update Production Order
// =========================
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      status,
      remarks,
      order_qty,
      planned_start_date,
      planned_end_date,
      warehouse_id,
    } = body;

    if (!status) {
      return Response.json({ error: "❌ Status is required" }, { status: 400 });
    }

    // Validate qty
    if (order_qty && (isNaN(order_qty) || Number(order_qty) <= 0)) {
      return Response.json({ error: "❌ Order quantity must be greater than 0" }, { status: 400 });
    }

    // Update header
    const [result] = await db.query(
      `UPDATE production_orders 
       SET status = ?, remarks = ?, order_qty = ?, planned_start_date = ?, planned_end_date = ?, warehouse_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        status,
        remarks || null,
        order_qty || null,
        planned_start_date || null,
        planned_end_date || null,
        warehouse_id || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return Response.json({ error: "❌ Production Order not found" }, { status: 404 });
    }

    // 🔹 Optional: agar order_qty change ho to components recalc karo
    if (order_qty) {
      // Pehle bom_id fetch karo
      const [[{ bom_id }]] = await db.query(
        `SELECT bom_id FROM production_orders WHERE id = ?`,
        [id]
      );

      if (bom_id) {
        // Purane components delete
        await db.query(`DELETE FROM production_order_items WHERE production_order_id = ?`, [id]);

        // BOM se naya recalc
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
            [id, comp.item_id, planned_qty]
          );
        }
      }
    }

    return Response.json({ message: "✅ Production Order updated successfully" });
  } catch (error) {
    console.error("❌ Production Order Update Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// DELETE - Delete Production Order
// =========================
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await db.query(`DELETE FROM production_order_items WHERE production_order_id = ?`, [id]);
    const [result] = await db.query(`DELETE FROM production_orders WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return Response.json({ error: "❌ Production Order not found" }, { status: 404 });
    }

    return Response.json({ message: "✅ Production Order deleted successfully" });
  } catch (error) {
    console.error("❌ Production Order DELETE Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
