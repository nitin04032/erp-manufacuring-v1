import { db } from "@/lib/db";

// ✅ GET single GRN (with items)
export async function GET(request, { params }) {
  try {
    const [rows] = await db.query(
      `SELECT grn.*, po.po_number, s.supplier_name
       FROM purchase_receipts grn
       LEFT JOIN purchase_orders po ON grn.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       WHERE grn.id = ?`,
      [params.id]
    );

    if (rows.length === 0) {
      return Response.json({ error: "GRN not found" }, { status: 404 });
    }

    const grn = rows[0];

    // ✅ fetch GRN items
    const [items] = await db.query(
      `SELECT gri.id, gri.item_id, gri.received_qty, gri.remarks,
              i.item_name, i.item_code, i.uom
       FROM purchase_receipt_items gri
       JOIN items i ON gri.item_id = i.id
       WHERE gri.receipt_id = ?`,
      [params.id]
    );

    grn.items = items;

    return Response.json(grn);
  } catch (error) {
    console.error("❌ GET GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE GRN (header + items)
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { receipt_date, remarks, status, items } = body;

    // ✅ update header
    await db.query(
      `UPDATE purchase_receipts 
       SET receipt_date=?, remarks=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [receipt_date, remarks, status, params.id]
    );

    // ✅ update items (if provided)
    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          `UPDATE purchase_receipt_items
           SET received_qty=?, remarks=?
           WHERE id=? AND receipt_id=?`,
          [item.received_qty, item.remarks || "", item.id, params.id]
        );
      }
    }

    return Response.json({ message: "GRN updated successfully" });
  } catch (error) {
    console.error("❌ PUT GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE GRN
export async function DELETE(request, { params }) {
  try {
    // ✅ delete items first
    await db.query(`DELETE FROM purchase_receipt_items WHERE receipt_id=?`, [params.id]);

    // ✅ delete GRN header
    await db.query("DELETE FROM purchase_receipts WHERE id=?", [params.id]);

    return Response.json({ message: "GRN deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
  