import { db } from "@/lib/db";

// ✅ GET - List all GRNs with PO + Supplier
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT grn.id, grn.receipt_date as grn_date, grn.remarks, grn.status,
              po.po_number, s.supplier_name
       FROM purchase_receipts grn
       LEFT JOIN purchase_orders po ON grn.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       ORDER BY grn.id DESC`
    );

    // Fetch items count for each GRN
    for (const grn of rows) {
      const [items] = await db.query(
        `SELECT COUNT(*) as item_count 
         FROM purchase_receipt_items 
         WHERE receipt_id = ?`,
        [grn.id]
      );
      grn.items = { length: items[0].item_count };
    }

    return Response.json(rows);
  } catch (error) {
    console.error("❌ GRN LIST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST - Create new GRN
export async function POST(request) {
  try {
    const body = await request.json();
    const { purchase_order_id, grn_date, remarks, items } = body;

    if (!purchase_order_id || !grn_date || !items || items.length === 0) {
      return Response.json({ error: "Invalid GRN data" }, { status: 400 });
    }

    // Insert GRN
    const [result] = await db.query(
      `INSERT INTO purchase_receipts (po_id, receipt_date, remarks, status)
       VALUES (?, ?, ?, "draft")`,
      [purchase_order_id, grn_date, remarks]
    );

    const receipt_id = result.insertId;

    // Insert GRN items
    for (const item of items) {
      await db.query(
        `INSERT INTO purchase_receipt_items 
         (receipt_id, item_id, received_qty, created_at)
         VALUES (?, ?, ?, NOW())`,
        [receipt_id, item.item_id, item.received_qty]
      );
    }

    // ✅ Check PO items vs received items
    const [poItems] = await db.query(
      `SELECT poi.id, poi.ordered_qty,
              IFNULL(SUM(pri.received_qty), 0) as total_received
       FROM purchase_order_items poi
       LEFT JOIN purchase_receipt_items pri ON poi.item_id = pri.item_id
       WHERE poi.po_id = ?
       GROUP BY poi.id, poi.ordered_qty`,
      [purchase_order_id]
    );

    let allReceived = true;
    for (const row of poItems) {
      if (row.total_received < row.ordered_qty) {
        allReceived = false;
        break;
      }
    }

    const newStatus = allReceived ? "completed" : "partial";

    await db.query(
      `UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, purchase_order_id]
    );

    return Response.json({ message: "GRN created successfully", receipt_id });
  } catch (error) {
    console.error("❌ GRN POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
