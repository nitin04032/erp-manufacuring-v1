// app/api/material-requisition/[id]/route.js
import { db } from "@/lib/db";

function sanitizeString(s) {
  return typeof s === "string" ? s.trim() : s;
}

const validStatuses = ["draft", "submitted", "approved", "rejected"];
const transitions = {
  draft: ["submitted"],
  submitted: ["approved", "rejected"],
  approved: [],
  rejected: []
};

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const [[mrRow]] = await db.query(
      `SELECT mr.*,
              po.order_number AS production_order_no,
              po.id AS production_order_id,
              po.warehouse_id AS production_order_warehouse_id
       FROM material_requisitions mr
       LEFT JOIN production_orders po ON mr.production_order_id = po.id
       WHERE mr.id = ?`,
      [id]
    );

    if (!mrRow) return Response.json({ error: "Requisition not found" }, { status: 404 });

    const [items] = await db.query(
      `SELECT mri.id,
              mri.item_id,
              mri.qty,
              mri.issued_qty,
              mri.uom,
              i.item_code,
              i.item_name
       FROM material_requisition_items mri
       LEFT JOIN items i ON mri.item_id = i.id
       WHERE mri.requisition_id = ?`,
      [id]
    );

    mrRow.items = items;
    return Response.json(mrRow);
  } catch (err) {
    console.error("Material Requisition GET detail error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  let conn = null;
  try {
    const { id } = params;
    const body = await req.json();
    const status = sanitizeString(body.status || null);
    const remarks = sanitizeString(body.remarks || null);
    const items = Array.isArray(body.items) ? body.items : null;

    // fetch current requisition
    const [[current]] = await db.query(`SELECT * FROM material_requisitions WHERE id = ?`, [id]);
    if (!current) return Response.json({ error: "Requisition not found" }, { status: 404 });

    // validate status
    if (status) {
      if (!validStatuses.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
      if (status !== current.status && !transitions[current.status].includes(status)) {
        return Response.json({ error: `Invalid status transition from ${current.status} to ${status}` }, { status: 400 });
      }
    }

    // prevent editing approved (unless you want explicit revert flow)
    if (current.status === "approved" && status && status !== "approved") {
      return Response.json({ error: "Approved requisitions cannot be modified" }, { status: 400 });
    }

    // validate items if provided
    if (Array.isArray(items)) {
      const seen = new Set();
      for (const it of items) {
        if (!it.item_id || isNaN(Number(it.qty)) || Number(it.qty) <= 0) {
          return Response.json({ error: "Each item must have item_id and qty > 0" }, { status: 400 });
        }
        if (seen.has(String(it.item_id))) {
          return Response.json({ error: "Duplicate items not allowed" }, { status: 400 });
        }
        seen.add(String(it.item_id));
      }
    }

    // Begin transaction (prefer connection if available)
    if (typeof db.getConnection === "function") {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // update header
      const [updRes] = await conn.query(
        `UPDATE material_requisitions
         SET status = COALESCE(?, status),
             remarks = COALESCE(?, remarks),
             updated_at = NOW()
         WHERE id = ?`,
        [status || null, remarks || null, id]
      );
      if (updRes.affectedRows === 0) {
        await conn.rollback();
        conn.release();
        return Response.json({ error: "Requisition not found" }, { status: 404 });
      }

      // replace items if provided
      if (Array.isArray(items)) {
        await conn.query(`DELETE FROM material_requisition_items WHERE requisition_id = ?`, [id]);
        for (const it of items) {
          await conn.query(
            `INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom, issued_qty)
             VALUES (?, ?, ?, ?, 0)`,
            [id, it.item_id, it.qty, it.uom || null]
          );
        }
      }

      // If approving, update production order issued_qty and insert stock ledger OUT entries
      if (status === "approved") {
        // find warehouse to use for ledger: prefer the production order warehouse, else fallback to NULL/1
        let warehouseId = null;
        if (current.production_order_id) {
          const [[poRow]] = await conn.query(`SELECT warehouse_id, order_number FROM production_orders WHERE id = ?`, [current.production_order_id]);
          if (poRow) warehouseId = poRow.warehouse_id || null;
        }

        for (const it of (items || [])) {
          // 1) Update production_order_items issued_qty (if linked)
          if (current.production_order_id) {
            await conn.query(
              `UPDATE production_order_items
               SET issued_qty = issued_qty + ?
               WHERE production_order_id = ? AND item_id = ?`,
              [it.qty, current.production_order_id, it.item_id]
            );
          }

          // 2) Stock ledger OUT entry
          // Determine previous balance for this item + warehouse (if warehouse null, look by item only)
          let lastBalance = null;
          if (warehouseId) {
            const [[lb]] = await conn.query(
              `SELECT balance_qty FROM stock_ledger WHERE item_id = ? AND warehouse_id = ? ORDER BY id DESC LIMIT 1`,
              [it.item_id, warehouseId]
            );
            lastBalance = lb?.balance_qty ?? null;
          }
          if (lastBalance === null) {
            // fallback: try last balance regardless of warehouse
            const [[lb2]] = await conn.query(
              `SELECT balance_qty FROM stock_ledger WHERE item_id = ? ORDER BY id DESC LIMIT 1`,
              [it.item_id]
            );
            lastBalance = lb2?.balance_qty ?? 0;
          }
          const prevBalance = Number(lastBalance || 0);
          const newBalance = prevBalance - Number(it.qty);

          // Insert INTO stock_ledger
          await conn.query(
            `INSERT INTO stock_ledger
             (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, transaction_date, remarks, created_at)
             VALUES (?, ?, ?, 'OUT', 'Material Requisition', ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
            [
              it.item_id,
              warehouseId || null,
              null, // location_id - none by default; change if you have location mapping
              id, // reference_id = requisition id
              current.requisition_no || null, // transaction_ref
              id, // transaction_id (same as reference id)
              it.qty,
              newBalance,
              remarks || null
            ]
          );
        }
      }

      await conn.commit();
      conn.release();
      return Response.json({ message: "Requisition updated" });
    } else {
      // Fallback transaction flow
      await db.query("START TRANSACTION");

      const [updRes] = await db.query(
        `UPDATE material_requisitions
         SET status = COALESCE(?, status),
             remarks = COALESCE(?, remarks),
             updated_at = NOW()
         WHERE id = ?`,
        [status || null, remarks || null, id]
      );
      if (updRes.affectedRows === 0) {
        await db.query("ROLLBACK");
        return Response.json({ error: "Requisition not found" }, { status: 404 });
      }

      if (Array.isArray(items)) {
        await db.query(`DELETE FROM material_requisition_items WHERE requisition_id = ?`, [id]);
        for (const it of items) {
          await db.query(
            `INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom, issued_qty)
             VALUES (?, ?, ?, ?, 0)`,
            [id, it.item_id, it.qty, it.uom || null]
          );
        }
      }

      if (status === "approved") {
        // try to get production order warehouse
        let warehouseId = null;
        if (current.production_order_id) {
          const [poRows] = await db.query(`SELECT warehouse_id FROM production_orders WHERE id = ?`, [current.production_order_id]);
          if (poRows.length) warehouseId = poRows[0].warehouse_id || null;
        }

        for (const it of (items || [])) {
          if (current.production_order_id) {
            await db.query(
              `UPDATE production_order_items
               SET issued_qty = issued_qty + ?
               WHERE production_order_id = ? AND item_id = ?`,
              [it.qty, current.production_order_id, it.item_id]
            );
          }

          // last balance
          let prevBalance = 0;
          if (warehouseId) {
            const [lbRows] = await db.query(
              `SELECT balance_qty FROM stock_ledger WHERE item_id = ? AND warehouse_id = ? ORDER BY id DESC LIMIT 1`,
              [it.item_id, warehouseId]
            );
            if (lbRows.length) prevBalance = Number(lbRows[0].balance_qty || 0);
            else {
              const [lbAll] = await db.query(`SELECT balance_qty FROM stock_ledger WHERE item_id = ? ORDER BY id DESC LIMIT 1`, [it.item_id]);
              prevBalance = lbAll.length ? Number(lbAll[0].balance_qty || 0) : 0;
            }
          } else {
            const [lbAll] = await db.query(`SELECT balance_qty FROM stock_ledger WHERE item_id = ? ORDER BY id DESC LIMIT 1`, [it.item_id]);
            prevBalance = lbAll.length ? Number(lbAll[0].balance_qty || 0) : 0;
          }
          const newBalance = prevBalance - Number(it.qty);

          await db.query(
            `INSERT INTO stock_ledger
             (item_id, warehouse_id, location_id, transaction_type, reference_type, reference_id, transaction_ref, transaction_id, qty, balance_qty, transaction_date, remarks, created_at)
             VALUES (?, ?, ?, 'OUT', 'Material Requisition', ?, ?, ?, ?, ?, NOW(), ?, NOW())`,
            [
              it.item_id,
              warehouseId || null,
              null,
              id,
              current.requisition_no || null,
              id,
              it.qty,
              newBalance,
              remarks || null
            ]
          );
        }
      }

      await db.query("COMMIT");
      return Response.json({ message: "Requisition updated" });
    }
  } catch (err) {
    console.error("Material Requisition PUT error:", err);
    try {
      if (conn) {
        await conn.rollback();
        conn.release();
      } else if (typeof db.query === "function") {
        await db.query("ROLLBACK");
      }
    } catch (rollErr) {
      console.error("Rollback error:", rollErr);
    }
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const [[row]] = await db.query(`SELECT status FROM material_requisitions WHERE id = ?`, [id]);
    if (!row) return Response.json({ error: "Requisition not found" }, { status: 404 });
    if (row.status === "approved") return Response.json({ error: "Approved requisitions cannot be deleted" }, { status: 400 });

    await db.query(`DELETE FROM material_requisitions WHERE id = ?`, [id]);
    return Response.json({ message: "Requisition deleted" });
  } catch (err) {
    console.error("Material Requisition DELETE error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
