import { db } from "@/lib/db";

// ✅ POST - Stock Adjustment
export async function POST(request) {
  try {
    const body = await request.json();
    const { item_id, location_id, adjustment_type, adjustment_qty, remarks } = body;

    if (!item_id || !location_id || !adjustment_type || !adjustment_qty) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Warehouse ID निकालना (location_id से)
    const [loc] = await db.query(
      `SELECT warehouse_id FROM locations WHERE id = ?`,
      [location_id]
    );
    if (loc.length === 0) {
      return Response.json({ error: "Invalid location" }, { status: 400 });
    }
    const warehouse_id = loc[0].warehouse_id;

    // ✅ Last balance निकालना
    const [last] = await db.query(
      `SELECT balance_qty 
       FROM stock_ledger 
       WHERE item_id=? AND warehouse_id=? 
       ORDER BY id DESC LIMIT 1`,
      [item_id, warehouse_id]
    );
    const prevBalance = last.length ? Number(last[0].balance_qty) : 0;

    // ✅ नया balance calculate करना
    const newBalance =
      adjustment_type === "in"
        ? prevBalance + Number(adjustment_qty)
        : prevBalance - Number(adjustment_qty);

    // ✅ Ledger में insert करना
    await db.query(
      `INSERT INTO stock_ledger 
       (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, qty, balance_qty, remarks, transaction_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item_id,
        warehouse_id,
        location_id,
        "adjustment", // हमेशा adjustment type
        "Adjustment",
        null,
        adjustment_qty,
        newBalance,
        remarks,
      ]
    );

    return Response.json({ message: "✅ Stock adjustment recorded successfully" });
  } catch (error) {
    console.error("❌ POST Stock Adjustment Error:", error);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
