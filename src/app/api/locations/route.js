import { db } from "@/lib/db";

// ✅ GET - All Locations
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT l.*, w.warehouse_name
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY l.location_name
    `);
    return Response.json(rows);
  } catch (error) {
    console.error("❌ GET Locations Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - Create Location
export async function POST(request) {
  try {
    const body = await request.json();
    const { location_name, location_code, warehouse_id, description, status } = body;

    if (!location_name || !location_code || !warehouse_id) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO locations 
       (location_name, location_code, warehouse_id, status, created_at, updated_at, description) 
       VALUES (?, ?, ?, ?, NOW(), NOW(), ?)`,
      [location_name, location_code, warehouse_id, status || "active", description || null]
    );

    return Response.json({ message: "Location created successfully", id: result.insertId });
  } catch (error) {
    console.error("❌ POST Location Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
