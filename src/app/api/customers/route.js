import { db } from "@/lib/db";

// ✅ GET all customers
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM customers ORDER BY created_at DESC"
    );
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - create new customer
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_type,
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
      credit_limit = 0,
      credit_days = 0,
      payment_terms,
      status = "active",
    } = body;

    // 🔹 Generate auto customer_code
    const [last] = await db.query(
      "SELECT customer_code FROM customers ORDER BY id DESC LIMIT 1"
    );

    let newCode = "CUST001";
    if (last.length > 0) {
      const lastCode = last[0].customer_code; // e.g. "CUST005"
      const num = parseInt(lastCode.replace("CUST", "")) + 1;
      newCode = "CUST" + num.toString().padStart(3, "0");
    }

    // 🔹 Insert into database
    const [result] = await db.query(
      `INSERT INTO customers 
      (customer_code, customer_name, customer_type, contact_person, email, phone, address, city, state, pincode, country, gst_number, pan_number, credit_limit, credit_days, payment_terms, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCode,
        customer_name,
        customer_type,
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
        credit_limit,
        credit_days,
        payment_terms,
        status,
      ]
    );

    return Response.json({
      id: result.insertId,
      customer_code: newCode,
      ...body,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
