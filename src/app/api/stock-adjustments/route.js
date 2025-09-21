import { db } from "@/lib/db";

// =========================
// ✅ GET - List Stock Adjustments
// =========================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT sa.*, i.item_name, i.item_code, w.warehouse_name
      FROM stock_adjustments sa
      JOIN items i ON sa.item_id = i.id
      JOIN warehouses w ON sa.warehouse_id = w.id
      ORDER BY sa.id DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("❌ Stock Adjustment GET Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// ✅ POST - Create Stock Adjustment
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { warehouse_id, item_id, adjustment_type, qty, reason } = body;

    if (!warehouse_id || !item_id || !adjustment_type || !qty) {
      return Response.json({ error: "❌ All fields are required." }, { status: 400 });
    }

    // 🔹 Auto Number Generate
    const [last] = await db.query(
      `SELECT adjustment_number FROM stock_adjustments ORDER BY id DESC LIMIT 1`
    );
    let nextNumber = "ADJ-0001";
    if (last.length > 0 && last[0].adjustment_number) {
      const lastNum = parseInt(last[0].adjustment_number.replace("ADJ-", "")) || 0;
      nextNumber = "ADJ-" + String(lastNum + 1).padStart(4, "0");
    }

    // 🔹 Insert Adjustment
    const [result] = await db.query(
      `INSERT INTO stock_adjustments 
       (adjustment_number, warehouse_id, item_id, adjustment_type, qty, reason) 
       VALUES (?, ?, ?, ?, ?, ?)`,

      [nextNumber, warehouse_id, item_id, adjustment_type, qty, reason || null]
    );

    const adjustment_id = result.insertId;

    // 🔹 Last Balance निकालो
    const [lastBalance] = await db.query(
      `SELECT balance_qty FROM stock_ledger 
       WHERE item_id=? AND warehouse_id=? 
       ORDER BY id DESC LIMIT 1`,
      [item_id, warehouse_id]
    );
    const prevBalance = lastBalance.length ? Number(lastBalance[0].balance_qty) : 0;

    // 🔹 New Balance
    const newBalance =
      adjustment_type === "IN"
        ? prevBalance + Number(qty)
        : prevBalance - Number(qty);

    // 🔹 Insert Stock Ledger
    await db.query(
      `INSERT INTO stock_ledger 
       (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, remarks, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        item_id,
        warehouse_id,
        null, // location_id
        adjustment_type,
        "Adjustment",
        adjustment_id,
        nextNumber,
        Date.now(),
        qty,
        newBalance,
        reason || "Stock Adjustment",
      ]
    );

    return Response.json({
      message: "✅ Stock Adjustment created successfully",
      adjustment_id,
      adjustment_number: nextNumber,
    });
  } catch (error) {
    console.error("❌ Stock Adjustment POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
