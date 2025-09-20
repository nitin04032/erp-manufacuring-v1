import { db } from "@/lib/db";

// ✅ GET single warehouse
export async function GET(request, { params }) {
  try {
    const [rows] = await db.query("SELECT * FROM warehouses WHERE id = ?", [params.id]);
    if (rows.length === 0) {
      return Response.json({ error: "Warehouse not found" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT - update warehouse
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { warehouse_name, location, capacity, status } = body;

    await db.query(
      `UPDATE warehouses 
       SET warehouse_name=?, location=?, capacity=?, status=? 
       WHERE id=?`,
      [warehouse_name, location, capacity, status, params.id]
    );

    return Response.json({ message: "Warehouse updated successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE - remove warehouse
export async function DELETE(request, { params }) {
  try {
    await db.query("DELETE FROM warehouses WHERE id = ?", [params.id]);
    return Response.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
