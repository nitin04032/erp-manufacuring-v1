import { db } from "@/lib/db";

// ✅ GET - All Locations
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT l.id, l.location_code, l.location_name, l.location_type,
             l.capacity, l.current_stock, l.is_default, l.status,
             l.created_at, l.updated_at,
             w.warehouse_name
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY l.location_name
    `);
    return Response.json(rows);
  } catch (error) {
    console.error("❌ GET Locations Error:", error);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// ✅ POST - Create Location
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      location_name,
      location_code,
      warehouse_id,
      location_type,
      parent_location_id,
      capacity,
      is_default,
      status,
    } = body;

    if (!location_name || !location_code || !warehouse_id) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO locations 
       (location_name, location_code, warehouse_id, location_type, parent_location_id, capacity, current_stock, is_default, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())`,
      [
        location_name,
        location_code,
        warehouse_id,
        location_type || "rack",
        parent_location_id || null,
        capacity || 0,
        is_default || 0,
        status || "active",
      ]
    );

    return Response.json({
      message: "✅ Location created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ POST Location Error:", error);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
