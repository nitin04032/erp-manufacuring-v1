import { db } from "@/lib/db";

// ✅ GET single GRN
export async function GET(request, { params }) {
  try {
    const [rows] = await db.query(
      `SELECT grn.*, po.po_number 
       FROM purchase_receipts grn
       LEFT JOIN purchase_orders po ON grn.po_id = po.id
       WHERE grn.id = ?`,
      [params.id]
    );

    if (rows.length === 0) {
      return Response.json({ error: "GRN not found" }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error("❌ GET GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE GRN
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { receipt_number, po_id, receipt_date, remarks } = body;

    await db.query(
      `UPDATE purchase_receipts 
       SET receipt_number=?, po_id=?, receipt_date=?, remarks=?, updated_at=NOW()
       WHERE id=?`,
      [receipt_number, po_id, receipt_date, remarks, params.id]
    );

    return Response.json({ message: "GRN updated successfully" });
  } catch (error) {
    console.error("❌ PUT GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE GRN
export async function DELETE(request, { params }) {
  try {
    await db.query("DELETE FROM purchase_receipts WHERE id=?", [params.id]);
    return Response.json({ message: "GRN deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
