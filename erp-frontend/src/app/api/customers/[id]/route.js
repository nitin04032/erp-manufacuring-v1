import { db } from "@/lib/db";

// 🔹 Get one customer
export async function GET(req, context) {
  try {
    const { id } = context.params;
    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);

    if (rows.length === 0) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 Update customer
export async function PUT(req, context) {
  try {
    const { id } = context.params;
    const body = await req.json();

    await db.query("UPDATE customers SET ? WHERE id = ?", [body, id]);

    return Response.json({ message: "Customer updated successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 🔹 Delete customer
export async function DELETE(req, context) {
  try {
    const { id } = context.params;
    await db.query("DELETE FROM customers WHERE id = ?", [id]);

    return Response.json({ message: "Customer deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
