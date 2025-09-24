import { db } from "@/lib/db";

// ✅ GET all suppliers
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM suppliers ORDER BY created_at DESC"
    );
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - create new supplier
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country = "India",
      gst_number,
      pan_number,
      payment_terms,
      credit_limit = 0,
      status = "active",
    } = body;

    // 🔹 Auto-generate supplier_code
    const [last] = await db.query(
      "SELECT supplier_code FROM suppliers ORDER BY id DESC LIMIT 1"
    );

    let newCode = "SUP001";
    if (last.length > 0) {
      const lastCode = last[0].supplier_code; // e.g. "SUP005"
      const num = parseInt(lastCode.replace("SUP", "")) + 1;
      newCode = "SUP" + num.toString().padStart(3, "0");
    }

    // 🔹 Insert into DB
    const [result] = await db.query(
      `INSERT INTO suppliers 
      (supplier_code, supplier_name, contact_person, email, phone, address, city, state, pincode, country, gst_number, pan_number, payment_terms, credit_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCode,
        supplier_name,
        contact_person,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        country,
        gst_number,
        pan_number,
        payment_terms,
        credit_limit,
        status,
      ]
    );

    return Response.json({
      id: result.insertId,
      supplier_code: newCode,
      ...body,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
