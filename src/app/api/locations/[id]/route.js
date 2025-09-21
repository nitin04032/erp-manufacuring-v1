import { db } from "@/lib/db";

// ✅ GET - Single Location
export async function GET(request, { params }) {
  try {
    const [rows] = await db.query(
      `SELECT l.*, w.warehouse_name 
       FROM locations l 
       JOIN warehouses w ON l.warehouse_id = w.id
       WHERE l.id = ?`,
      [params.id]
    );

    if (rows.length === 0) {
      return Response.json({ message: "Location not found" }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error("❌ GET Location Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT - Update Location
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { location_name, location_code, warehouse_id, description, status } = body;

    await db.query(
      `UPDATE locations 
       SET location_name=?, location_code=?, warehouse_id=?, description=?, status=?, updated_at=NOW() 
       WHERE id=?`,
      [location_name, location_code, warehouse_id, description || null, status, params.id]
    );

    return Response.json({ message: "Location updated successfully" });
  } catch (error) {
    console.error("❌ PUT Location Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove Location
export async function DELETE(request, { params }) {
  try {
    await db.query(`DELETE FROM locations WHERE id=?`, [params.id]);
    return Response.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE Location Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
