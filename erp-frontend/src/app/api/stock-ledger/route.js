import { db } from "@/lib/db";

// ✅ GET - Stock Ledger (with filters)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transaction_type = searchParams.get("transaction_type");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        sl.id,
        sl.created_at AS transaction_date,   -- तुमने transaction_date column नहीं रखा, इसलिए created_at इस्तेमाल किया
        sl.transaction_type,
        sl.reference_type,
        sl.reference_id,
        sl.transaction_ref,
        sl.transaction_id,
        sl.qty,
        sl.balance_qty,
        sl.remarks,
        i.item_code,
        i.item_name,
        w.warehouse_name,
        l.location_name,
        CASE WHEN sl.transaction_type = 'IN' THEN sl.qty ELSE 0 END AS in_qty,
        CASE WHEN sl.transaction_type = 'OUT' THEN sl.qty ELSE 0 END AS out_qty
      FROM stock_ledger sl
      JOIN items i ON sl.item_id = i.id
      JOIN warehouses w ON sl.warehouse_id = w.id
      LEFT JOIN locations l ON sl.location_id = l.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by transaction_type
    if (transaction_type) {
      query += ` AND sl.transaction_type = ?`;
      params.push(transaction_type);
    }

    // Search filter
    if (search) {
      query += ` AND (i.item_code LIKE ? OR i.item_name LIKE ? OR w.warehouse_name LIKE ? OR l.location_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY sl.created_at DESC, sl.id DESC`;

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (error) {
    console.error("❌ GET Stock Ledger Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
