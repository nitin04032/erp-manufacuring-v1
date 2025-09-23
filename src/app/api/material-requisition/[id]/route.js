// app/api/material-requisition/[id]/route.js
import { db } from "@/lib/db";

function sanitizeString(s) { return typeof s === "string" ? s.trim() : s; }

const validStatuses = ["draft","submitted","approved","rejected"];
const transitions = {
  draft: ["submitted"],
  submitted: ["approved","rejected"],
  approved: [],
  rejected: []
};

// Placeholder role check — replace with your auth system
async function requireRole(req, roles = []) {
  // e.g., check cookies / headers / token
  // If you have an auth system, verify here and throw if not allowed.
  return true;
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const [[mrRow]] = await db.query(
      `SELECT mr.*, po.order_number AS production_order_no
       FROM material_requisitions mr
       LEFT JOIN production_orders po ON mr.production_order_id = po.id
       WHERE mr.id = ?`,
      [id]
    );

    if (!mrRow) return Response.json({ error: "Requisition not found" }, { status: 404 });

    const [items] = await db.query(
      `SELECT mri.*, i.item_code, i.item_name FROM material_requisition_items mri
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

    // require auth/role if status is being set to approved/rejected (example)
    // await requireRole(req, ['manager','storekeeper']); // uncomment & adapt

    // fetch current requisition
    const [[current]] = await db.query(`SELECT * FROM material_requisitions WHERE id = ?`, [id]);
    if (!current) return Response.json({ error: "Requisition not found" }, { status: 404 });

    // prevent editing approved records (header)
    if (current.status === "approved" && (status && status !== "approved")) {
      // you may still allow only status change by authorized roles — adapt as needed
      return Response.json({ error: "Approved requisitions cannot be modified" }, { status: 400 });
    }

    // if status provided, validate transition
    if (status) {
      if (!validStatuses.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
      if (status !== current.status && !transitions[current.status].includes(status)) {
        return Response.json({ error: `Invalid status transition from ${current.status} to ${status}` }, { status: 400 });
      }
    }

    // Start transaction
    if (typeof db.getConnection === "function") {
      conn = await db.getConnection();
      await conn.beginTransaction();

      const [resUpdate] = await conn.query(
        `UPDATE material_requisitions SET status = COALESCE(?, status), remarks = COALESCE(?, remarks), updated_at = NOW() WHERE id = ?`,
        [status || null, remarks || null, id]
      );
      if (resUpdate.affectedRows === 0) {
        await conn.rollback();
        conn.release();
        return Response.json({ error: "Requisition not found" }, { status: 404 });
      }

      if (Array.isArray(items)) {
        // validate items
        const seen = new Set();
        for (const it of items) {
          if (!it.item_id || isNaN(Number(it.qty)) || Number(it.qty) <= 0) {
            await conn.rollback();
            conn.release();
            return Response.json({ error: "Each item must have item_id and qty > 0" }, { status: 400 });
          }
          if (seen.has(String(it.item_id))) {
            await conn.rollback();
            conn.release();
            return Response.json({ error: "Duplicate items not allowed" }, { status: 400 });
          }
          seen.add(String(it.item_id));
        }

        await conn.query(`DELETE FROM material_requisition_items WHERE requisition_id = ?`, [id]);
        for (const it of items) {
          await conn.query(
            `INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom) VALUES (?, ?, ?, ?)`,
            [id, it.item_id, it.qty, it.uom || null]
          );
        }
      }

      await conn.commit();
      conn.release();
      return Response.json({ message: "Requisition updated" });
    } else {
      // fallback
      await db.query("START TRANSACTION");
      const [resUpdate] = await db.query(
        `UPDATE material_requisitions SET status = COALESCE(?, status), remarks = COALESCE(?, remarks), updated_at = NOW() WHERE id = ?`,
        [status || null, remarks || null, id]
      );
      if (resUpdate.affectedRows === 0) {
        await db.query("ROLLBACK");
        return Response.json({ error: "Requisition not found" }, { status: 404 });
      }
      if (Array.isArray(items)) {
        for (const it of items) {
          if (!it.item_id || isNaN(Number(it.qty)) || Number(it.qty) <= 0) {
            await db.query("ROLLBACK");
            return Response.json({ error: "Each item must have item_id and qty > 0" }, { status: 400 });
          }
        }
        await db.query(`DELETE FROM material_requisition_items WHERE requisition_id = ?`, [id]);
        for (const it of items) {
          await db.query(
            `INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom) VALUES (?, ?, ?, ?)`,
            [id, it.item_id, it.qty, it.uom || null]
          );
        }
      }
      await db.query("COMMIT");
      return Response.json({ message: "Requisition updated" });
    }
  } catch (err) {
    console.error("Material Requisition PUT error:", err);
    try {
      if (conn) { await conn.rollback(); conn.release(); }
      else if (typeof db.query === "function") await db.query("ROLLBACK");
    } catch (rollErr) {
      console.error("Rollback error:", rollErr);
    }
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    // ensure not approved
    const [[row]] = await db.query(`SELECT status FROM material_requisitions WHERE id = ?`, [id]);
    if (!row) return Response.json({ error: "Requisition not found" }, { status: 404 });
    if (row.status === "approved") return Response.json({ error: "Approved requisitions cannot be deleted" }, { status: 400 });

    const [resDel] = await db.query(`DELETE FROM material_requisitions WHERE id = ?`, [id]);
    if (resDel.affectedRows === 0) return Response.json({ error: "Requisition not found" }, { status: 404 });
    return Response.json({ message: "Requisition deleted" });
  } catch (err) {
    console.error("Material Requisition DELETE error:", err);
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
