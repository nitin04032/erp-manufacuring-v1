import { db } from "@/lib/db";

// ✅ GET - Single item
export async function GET(request, { params }) {
  try {
    const [rows] = await db.query("SELECT * FROM items WHERE id = ?", [params.id]);
    if (rows.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT - Update item
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const {
      item_name,
      item_type = "raw_material",
      item_category,
      uom,
      hsn_code,
      gst_rate = 0,
      purchase_rate = 0,
      sale_rate = 0,
      minimum_stock = 0,
      maximum_stock = 0,
      reorder_level = 0,
      status = "active",
    } = body;

    await db.query(
      `UPDATE items SET 
        item_name=?, item_type=?, item_category=?, uom=?, hsn_code=?, gst_rate=?, 
        purchase_rate=?, sale_rate=?, minimum_stock=?, maximum_stock=?, reorder_level=?, status=? 
      WHERE id=?`,
      [
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
        params.id,
      ]
    );

    return Response.json({ message: "Item updated successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove item
export async function DELETE(request, { params }) {
  try {
    await db.query("DELETE FROM items WHERE id = ?", [params.id]);
    return Response.json({ message: "Item deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
