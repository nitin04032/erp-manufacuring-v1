import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM warehouses ORDER BY created_at DESC");
    return Response.json(rows);
  } catch (error) {
    console.error("GET Warehouses Error:", error); // debugging
    return Response.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      warehouse_name,
      warehouse_code,
      description,
      address,
      city,
      state,
      country = "India",
      pincode,
      contact_person,
      phone,
      email,
      status = "active",
    } = body;

    if (!warehouse_name || !warehouse_code) {
      return Response.json({ error: "Warehouse Name & Code are required" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO warehouses 
      (warehouse_name, warehouse_code, description, address, city, state, country, pincode, contact_person, phone, email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        warehouse_name,
        warehouse_code,
        description || "",
        address || "",
        city || "",
        state || "",
        country,
        pincode || "",
        contact_person || "",
        phone || "",
        email || "",
        status,
      ]
    );

    return Response.json({ id: result.insertId, ...body });
  } catch (error) {
    console.error("POST Warehouse Error:", error); // debugging
    return Response.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
