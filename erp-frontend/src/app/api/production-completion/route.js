import { db } from "@/lib/db";

function sanitizeString(s) {
  return typeof s === "string" ? s.trim() : s;
}

export async function POST(req) {
  let conn;
  try {
    const body = await req.json();
    const production_order_id = body.production_order_id;
    const produced_qty = Number(body.produced_qty);
    const warehouse_id = body.warehouse_id;
    const location_id = body.location_id || null;
    const remarks = sanitizeString(body.remarks || "");

    // ✅ Validation
    if (!production_order_id) {
      return Response.json({ error: "production_order_id is required" }, { status: 400 });
    }
    if (isNaN(produced_qty) || produced_qty <= 0) {
      return Response.json({ error: "produced_qty must be > 0" }, { status: 400 });
    }
    if (!warehouse_id) {
      return Response.json({ error: "warehouse_id is required" }, { status: 400 });
    }

    // ✅ Get production order
    const [[order]] = await db.query(
      `SELECT * FROM production_orders WHERE id = ?`,
      [production_order_id]
    );
    if (!order) {
      return Response.json({ error: "Production order not found" }, { status: 404 });
    }

    // ✅ Begin Transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update production_orders
    await conn.query(
      `UPDATE production_orders 
       SET produced_qty = produced_qty + ?, status = 'completed', updated_at = NOW()
       WHERE id = ?`,
      [produced_qty, production_order_id]
    );

    // Insert Stock Ledger (FG IN)
    await conn.query(
      `INSERT INTO stock_ledger 
       (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, transaction_date, remarks, created_at)
       VALUES (?, ?, ?, 'IN', 'Production Order', ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
      [
        order.fg_item_id,
        warehouse_id,
        location_id,
        production_order_id,
        order.order_number,
        production_order_id,
        produced_qty,
        produced_qty, // balance update karna hoga agar running balance logic chahiye
        remarks,
      ]
    );

    await conn.commit();
    conn.release();

    return Response.json({
      message: "Production completed successfully",
      production_order_id,
      produced_qty,
    });
  } catch (err) {
    console.error("❌ Production Completion API error:", err);
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
