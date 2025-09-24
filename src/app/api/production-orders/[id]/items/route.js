import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return Response.json({ error: "Missing production order id" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT 
         poi.item_id, 
         i.item_code, 
         i.item_name, 
         poi.planned_qty, 
         poi.issued_qty, 
         (poi.planned_qty - IFNULL(poi.issued_qty,0)) AS pending_qty,
         COALESCE(poi.uom, i.uom, '') AS uom
       FROM production_order_items poi
       LEFT JOIN items i ON poi.item_id = i.id
       WHERE poi.production_order_id = ?
       ORDER BY poi.id ASC`,
      [id]
    );

    return Response.json(rows);
  } catch (err) {
    console.error("❌ Fetch PO items error:", err);
    return Response.json({ error: "Failed to fetch production order items" }, { status: 500 });
  }
}
