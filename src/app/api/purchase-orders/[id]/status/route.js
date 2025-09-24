import { db } from "@/lib/db";

// ✅ PUT - Update PO Status
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { status } = body;

    await db.query(
      "UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, params.id]
    );

    return Response.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("❌ Update Status Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
