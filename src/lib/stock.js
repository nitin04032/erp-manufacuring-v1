// lib/stock.js
import { db } from "@/lib/db";

// ✅ get latest balance of an item
export async function getCurrentBalance(item_id, warehouse_id, location_id=null) {
  const [rows] = await db.query(
    `SELECT balance_qty 
     FROM stock_ledger 
     WHERE item_id=? AND warehouse_id=? ${location_id ? "AND location_id=?" : ""} 
     ORDER BY id DESC LIMIT 1`,
    location_id ? [item_id, warehouse_id, location_id] : [item_id, warehouse_id]
  );
  return rows.length ? Number(rows[0].balance_qty) : 0;
}

// ✅ add stock transaction
export async function addStockTransaction({
  item_id,
  warehouse_id,
  location_id=null,
  qty,
  transaction_type, // 'IN' or 'OUT'
  reference_type,
  reference_id,
  transaction_ref,
  remarks
}) {
  const balance = await getCurrentBalance(item_id, warehouse_id, location_id);
  const newBalance = transaction_type === "IN"
    ? balance + Number(qty)
    : balance - Number(qty);

  await db.query(
    `INSERT INTO stock_ledger 
      (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, remarks, transaction_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      item_id,
      warehouse_id,
      location_id,
      transaction_type,
      reference_type,
      reference_id,
      transaction_ref,
      reference_id, // for now use reference_id as transaction_id
      qty,
      newBalance,
      remarks || null
    ]
  );

  return newBalance;
}
