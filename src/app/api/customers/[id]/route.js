import { db } from "@/lib/db";

// GET customer by ID
export async function GET(request, context) {
  try {
    const { id } = await context.params; // ✅ params को await करना ज़रूरी है

    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);

    if (rows.length === 0) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - update customer
export async function PUT(request, context) {
  try {
    const { id } = await context.params; // ✅ await
    const body = await request.json();

    await db.query(
      `UPDATE customers SET 
        customer_name = ?, 
        contact_person = ?, 
        email = ?, 
        phone = ?, 
        address = ?, 
        city = ?, 
        state = ?, 
        pincode = ?, 
        country = ?, 
        gst_number = ?, 
        credit_limit = ?, 
        status = ? 
      WHERE id = ?`,
      [
        body.customer_name,
        body.contact_person,
        body.email,
        body.phone,
        body.address,
        body.city,
        body.state,
        body.pincode,
        body.country,
        body.gst_number,
        body.credit_limit || 0,
        body.status || "active",
        id,
      ]
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(request, context) {
  try {
    const { id } = await context.params; // ✅ await

    await db.query("DELETE FROM customers WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
