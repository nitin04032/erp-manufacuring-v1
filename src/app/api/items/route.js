import { db } from "@/lib/db";

// ✅ GET all items
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM items ORDER BY created_at DESC");
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - create new item
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_code,
      item_name,
      item_type = "raw_material", // default
      item_category = "",
      uom = "pcs",                // ✅ default value added
      hsn_code = "",
      gst_rate = 0,
      purchase_rate = 0,
      sale_rate = 0,
      minimum_stock = 0,
      maximum_stock = 0,
      reorder_level = 0,
      status = "active",
    } = body;

    if (!item_name || !item_code) {
      return Response.json(
        { error: "Item Code and Item Name are required" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO items 
      (item_code, item_name, item_type, item_category, uom, hsn_code, gst_rate, purchase_rate, sale_rate, minimum_stock, maximum_stock, reorder_level, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item_code,
        item_name,
        item_type,
        item_category,
        uom,
        hsn_code,
        gst_rate,
        purchase_rate,
        sale_rate,
        minimum_stock,
        maximum_stock,
        reorder_level,
        status,
      ]
    );

    return Response.json({ id: result.insertId, ...body });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
    