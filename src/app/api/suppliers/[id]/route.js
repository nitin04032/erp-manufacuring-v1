import { db } from "@/lib/db";

// ✅ GET one supplier
export async function GET(req, { params }) {
  try {
    const [rows] = await db.query("SELECT * FROM suppliers WHERE id = ?", [
      params.id,
    ]);

    if (rows.length === 0) {
      return Response.json({ error: "Supplier not found" }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE supplier
export async function PUT(req, { params }) {
  try {
    const body = await req.json();

    const [result] = await db.query(
      `UPDATE suppliers SET 
        supplier_name=?, contact_person=?, email=?, phone=?, address=?, 
        city=?, state=?, pincode=?, country=?, gst_number=?, pan_number=?, 
        payment_terms=?, credit_limit=?, status=? 
      WHERE id=?`,
      [
        body.supplier_name,
        body.contact_person,
        body.email,
        body.phone,
        body.address,
        body.city,
        body.state,
        body.pincode,
        body.country,
        body.gst_number,
        body.pan_number,
        body.payment_terms,
        body.credit_limit,
        body.status,
        params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return Response.json({ error: "Supplier not found" }, { status: 404 });
    }

    return Response.json({ message: "Supplier updated successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE supplier
export async function DELETE(req, { params }) {
  try {
    const [result] = await db.query("DELETE FROM suppliers WHERE id = ?", [
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return Response.json({ error: "Supplier not found" }, { status: 404 });
    }

    return Response.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
