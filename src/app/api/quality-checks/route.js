import { db } from "@/lib/db";

// =========================
// ✅ GET - QC List
// =========================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT qc.id, qc.status, qc.remarks, qc.created_at,
             grn.receipt_number, grn.receipt_date,
             s.supplier_name
      FROM quality_checks qc
      JOIN purchase_receipts grn ON qc.receipt_id = grn.id
      JOIN purchase_orders po ON grn.po_id = po.id
      JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY qc.id DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("❌ QC GET Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// ✅ POST - Create QC Entry (with multiple items)
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { receipt_id, status, remarks, items } = body;

    if (!receipt_id || !status || !items || items.length === 0) {
      return Response.json({ error: "❌ All fields are required" }, { status: 400 });
    }

    // 🔹 Save QC Master
    const [qcResult] = await db.query(
      `INSERT INTO quality_checks (receipt_id, item_id, checked_qty, status, remarks)
       VALUES (?, NULL, 0, ?, ?)`,
      [receipt_id, status, remarks || null]
    );

    const qc_id = qcResult.insertId;

    // 🔹 Loop through QC Items
    for (const row of items) {
      const { item_id, qty, result, remarks: itemRemarks } = row;

      await db.query(
        `INSERT INTO quality_check_items (qc_id, item_id, qty, result, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [qc_id, item_id, qty, result || "pending", itemRemarks || null]
      );

      // 🔹 If item result = pass → update stock ledger
      if (result === "pass") {
        // Last Balance निकालो
        const [last] = await db.query(
          `SELECT balance_qty FROM stock_ledger 
           WHERE item_id=? 
           ORDER BY id DESC LIMIT 1`,
          [item_id]
        );
        const prevBalance = last.length ? Number(last[0].balance_qty) : 0;
        const newBalance = prevBalance + Number(qty);

        // Insert Stock Ledger
        await db.query(
          `INSERT INTO stock_ledger 
           (item_id, warehouse_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, remarks, created_at) 
           SELECT pri.item_id, po.warehouse_id, 'IN', 'QC', ?, ?, ?, ?, ?, ?, NOW()
           FROM purchase_receipts pr
           JOIN purchase_orders po ON pr.po_id = po.id
           JOIN purchase_receipt_items pri ON pr.id = pri.receipt_id AND pri.item_id = ?
           WHERE pr.id = ?`,
          [
            qc_id,
            "QC-" + qc_id,
            Date.now(),
            qty,
            newBalance,
            "QC Passed",
            item_id,
            receipt_id,
          ]
        );
      }
    }

    return Response.json({ message: "✅ QC processed successfully", qc_id });
  } catch (error) {
    console.error("❌ QC POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
