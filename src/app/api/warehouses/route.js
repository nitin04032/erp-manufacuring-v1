import { db } from "@/lib/db";

// ✅ GET all warehouses
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM warehouses ORDER BY created_at DESC");
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - create new warehouse
export async function POST(request) {
  try {
    const body = await request.json();
    const { warehouse_name, location, capacity, status = "active" } = body;

    const [result] = await db.query(
      `INSERT INTO warehouses (warehouse_name, location, capacity, status)
       VALUES (?, ?, ?, ?)`,
      [warehouse_name, location, capacity, status]
    );

    return Response.json({ id: result.insertId, ...body });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
