import { db } from "@/lib/db";

// ✅ GET all GRNs
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT grn.*, po.po_number 
       FROM purchase_receipts grn
       LEFT JOIN purchase_orders po ON grn.po_id = po.id
       ORDER BY grn.created_at DESC`
    );
    return Response.json(rows);
  } catch (error) {
    console.error("❌ GET GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ CREATE GRN
export async function POST(request) {
  try {
    const body = await request.json();
    const { receipt_number, po_id, receipt_date, remarks } = body;

    if (!receipt_number || !po_id || !receipt_date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO purchase_receipts (receipt_number, po_id, receipt_date, remarks) 
       VALUES (?, ?, ?, ?)`,
      [receipt_number, po_id, receipt_date, remarks]
    );

    return Response.json({
      message: "GRN created successfully",
      id: result.insertId
    });
  } catch (error) {
    console.error("❌ POST GRN Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
