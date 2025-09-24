import { db } from "@/lib/db";

// ✅ GET - Single Purchase Order (with items)
export async function GET(request, { params }) {
  try {
    // Header
    const [orders] = await db.query(
      `SELECT po.*, s.supplier_name, w.warehouse_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       JOIN warehouses w ON po.warehouse_id = w.id
       WHERE po.id = ?`,
      [params.id]
    );

    if (orders.length === 0) {
      return Response.json({ error: "Purchase Order not found" }, { status: 404 });
    }

    const purchaseOrder = orders[0];

    // Cast numbers
    purchaseOrder.subtotal = parseFloat(purchaseOrder.subtotal) || 0;
    purchaseOrder.discount_amount = parseFloat(purchaseOrder.discount_amount) || 0;
    purchaseOrder.tax_amount = parseFloat(purchaseOrder.tax_amount) || 0;
    purchaseOrder.total_amount = parseFloat(purchaseOrder.total_amount) || 0;

    // Items
    const [items] = await db.query(
      `SELECT poi.*, i.item_name, i.item_code, i.uom
       FROM purchase_order_items poi
       JOIN items i ON poi.item_id = i.id
       WHERE poi.po_id = ?`,
      [params.id]
    );

    purchaseOrder.items = items.map((it) => ({
      ...it,
      ordered_qty: parseFloat(it.ordered_qty) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
      discount_percent: parseFloat(it.discount_percent) || 0,
      tax_percent: parseFloat(it.tax_percent) || 0,
    }));

    return Response.json(purchaseOrder);
  } catch (error) {
    console.error("❌ GET Single PO Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ PUT - Update Purchase Order
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const {
      supplier_id,
      warehouse_id,
      po_date,
      expected_delivery_date,
      terms_and_conditions,
      remarks,
      status,
      subtotal,
      discount_amount,
      tax_amount,
      total_amount,
    } = body;

    await db.query(
      `UPDATE purchase_orders 
       SET supplier_id=?, warehouse_id=?, po_date=?, expected_delivery_date=?, terms_and_conditions=?, remarks=?, status=?, subtotal=?, discount_amount=?, tax_amount=?, total_amount=?, updated_at=NOW()
       WHERE id=?`,
      [
        supplier_id,
        warehouse_id,
        po_date,
        expected_delivery_date,
        terms_and_conditions,
        remarks,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        params.id,
      ]
    );

    return Response.json({ message: "Purchase Order updated successfully" });
  } catch (error) {
    console.error("❌ PUT PO Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove PO (with items)
export async function DELETE(request, { params }) {
  try {
    await db.query("DELETE FROM purchase_order_items WHERE po_id = ?", [params.id]);
    await db.query("DELETE FROM purchase_orders WHERE id = ?", [params.id]);

    return Response.json({ message: "Purchase Order deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE PO Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
