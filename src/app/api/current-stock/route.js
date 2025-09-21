import { db } from "@/lib/db";

// ✅ GET - Current Stock (warehouse + search filter)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const warehouseId = searchParams.get("warehouse_id") || "";

    let query = `
      SELECT 
        i.id,
        i.item_code,
        i.item_name,
        i.reorder_level,
        w.warehouse_name,
        IFNULL(SUM(CASE 
            WHEN sl.transaction_type IN ('purchase','production','adjustment') THEN sl.qty
            WHEN sl.transaction_type = 'sale' THEN -sl.qty
            ELSE 0 END
        ), 0) AS current_stock
      FROM items i
      JOIN stock_ledger sl ON sl.item_id = i.id
      JOIN warehouses w ON sl.warehouse_id = w.id
      WHERE 1=1
    `;

    const params = [];

    // 🔹 Search filter
    if (search) {
      query += ` AND (i.item_code LIKE ? OR i.item_name LIKE ? OR w.warehouse_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 🔹 Warehouse filter
    if (warehouseId) {
      query += ` AND w.id = ?`;
      params.push(warehouseId);
    }

    query += ` GROUP BY i.id, w.id ORDER BY i.item_name`;

    const [rows] = await db.query(query, params);
    return Response.json(rows);
  } catch (error) {
    console.error("❌ GET Current Stock Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
