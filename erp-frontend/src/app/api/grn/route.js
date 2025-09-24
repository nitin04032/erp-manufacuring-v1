import { db } from "@/lib/db";

// =========================
// ✅ GET - List all GRNs
// =========================
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT 
         grn.id,
         grn.receipt_number,
         grn.receipt_date,
         grn.remarks,
         grn.status,
         grn.invoice_number,
         po.po_number,
         s.supplier_name,
         (
           SELECT COUNT(*) 
           FROM purchase_receipt_items pri 
           WHERE pri.receipt_id = grn.id
         ) AS item_count
       FROM purchase_receipts grn
       LEFT JOIN purchase_orders po ON grn.po_id = po.id
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       ORDER BY grn.id DESC`
    );

    return Response.json(rows);
  } catch (error) {
    console.error("❌ GRN LIST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =========================
// ✅ POST - Create new GRN
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { purchase_order_id, grn_date, remarks, items, invoice_number } = body;

    // 1️⃣ Required validation
    if (!purchase_order_id || !grn_date || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "❌ Purchase Order, Date और Items required हैं." }, { status: 400 });
    }

    // 2️⃣ Check duplicate GRN for same PO
    const [existing] = await db.query(
      `SELECT id FROM purchase_receipts WHERE po_id = ? LIMIT 1`,
      [purchase_order_id]
    );
    if (existing.length > 0) {
      return Response.json({ error: "❌ इस PO के लिए GRN पहले से बन चुका है." }, { status: 400 });
    }

    // 3️⃣ Validate items qty
    for (const item of items) {
      if (!item.item_id || Number(item.received_qty) <= 0) {
        return Response.json(
          { error: `❌ Item ${item.item_name || ""} की Quantity valid नहीं है.` },
          { status: 400 }
        );
      }

      const [poItem] = await db.query(
        `SELECT ordered_qty FROM purchase_order_items WHERE po_id = ? AND item_id = ? LIMIT 1`,
        [purchase_order_id, item.item_id]
      );

      if (poItem.length && Number(item.received_qty) > Number(poItem[0].ordered_qty)) {
        return Response.json(
          { error: `❌ Item ${item.item_name} की Received Qty Ordered Qty से ज्यादा नहीं हो सकती.` },
          { status: 400 }
        );
      }
    }

    // 4️⃣ Auto Number Generate
    const [last] = await db.query(`SELECT receipt_number FROM purchase_receipts ORDER BY id DESC LIMIT 1`);
    let nextNumber = "GRN-0001";
    if (last.length > 0 && last[0].receipt_number) {
      const lastNum = parseInt(last[0].receipt_number.replace("GRN-", "")) || 0;
      nextNumber = "GRN-" + String(lastNum + 1).padStart(4, "0");
    }

    // 5️⃣ Insert GRN Header
    const [result] = await db.query(
      `INSERT INTO purchase_receipts (receipt_number, po_id, receipt_date, remarks, invoice_number, status)
       VALUES (?, ?, ?, ?, ?, "draft")`,
      [nextNumber, purchase_order_id, grn_date, remarks, invoice_number || null]
    );

    const receipt_id = result.insertId;

    // 6️⃣ Insert GRN Items + Update Stock
    for (const item of items) {
      // Save GRN item
      await db.query(
        `INSERT INTO purchase_receipt_items 
         (receipt_id, item_id, received_qty, remarks, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [receipt_id, item.item_id, item.received_qty, item.remarks || ""]
      );

      // 🔹 Find warehouse from PO
      const [poRow] = await db.query(
        `SELECT warehouse_id FROM purchase_orders WHERE id=?`,
        [purchase_order_id]
      );
      const warehouse_id = poRow[0]?.warehouse_id || null;

      if (!warehouse_id) continue;

      // 🔹 Get last stock balance
      const [lastStock] = await db.query(
        `SELECT balance_qty FROM stock_ledger 
         WHERE item_id=? AND warehouse_id=? 
         ORDER BY id DESC LIMIT 1`,
        [item.item_id, warehouse_id]
      );
      const prevBalance = lastStock.length ? Number(lastStock[0].balance_qty) : 0;

      // 🔹 New Balance
      const newBalance = prevBalance + Number(item.received_qty);

      // 🔹 Insert into Stock Ledger
      await db.query(
        `INSERT INTO stock_ledger 
         (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, remarks, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          item.item_id,
          warehouse_id,
          null, // location_id optional
          "IN",
          "GRN",
          receipt_id,
          nextNumber,
          Date.now(),
          item.received_qty,
          newBalance,
          "Goods Received",
        ]
      );
    }

    return Response.json({
      message: "✅ GRN created & stock updated",
      receipt_id,
      receipt_number: nextNumber,
    });
  } catch (error) {
    console.error("❌ GRN POST Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
