import { db } from "@/lib/db";

// =========================
// ✅ GET - QC List with items_count
// =========================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        qc.id, qc.qc_number, qc.qc_date, qc.inspector, qc.status, qc.remarks,
        COUNT(qci.id) AS items_count
      FROM quality_checks qc
      LEFT JOIN quality_check_items qci ON qc.id = qci.qc_id
      GROUP BY qc.id
      ORDER BY qc.id DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("❌ QC GET Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// ✅ POST - Create QC (header + items)
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { qc_number, qc_date, reference_type, inspector, remarks, status, items } = body;

    // 1️⃣ Validation
    if (
      !qc_number ||
      !qc_date ||
      !reference_type ||
      !inspector ||
      !status ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return Response.json({ error: "❌ All fields are required" }, { status: 400 });
    }

    // 2️⃣ Insert QC Header (quality_checks table)
    const [result] = await db.query(
      `INSERT INTO quality_checks (qc_number, qc_date, receipt_id, item_id, checked_qty, status, remarks, created_at, inspector)
       VALUES (?, ?, NULL, NULL, 0, ?, ?, NOW(), ?)`,
      [qc_number, qc_date, status, remarks || null, inspector]
    );

    const qc_id = result.insertId;

    // 3️⃣ Insert QC Items (quality_check_items table)
    for (const item of items) {
      if (!item.item_id || !item.qty) continue;

      await db.query(
        `INSERT INTO quality_check_items (qc_id, item_id, qty, result, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [qc_id, item.item_id, item.qty, item.result || "pending", item.remarks || null]
      );
    }

    return Response.json({
      message: "✅ QC created successfully",
      qc_id,
      qc_number,
    });
  } catch (error) {
    console.error("❌ QC POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
