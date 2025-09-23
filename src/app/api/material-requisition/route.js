// app/api/material-requisition/route.js
import { db } from "@/lib/db";

function sanitizeString(s) {
  return typeof s === "string" ? s.trim() : s;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = sanitizeString(searchParams.get("status") || "");
    const search = sanitizeString(searchParams.get("search") || "");
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const pageSize = Math.max(1, Math.min(200, parseInt(searchParams.get("pageSize")) || 20));
    const offset = (page - 1) * pageSize;

    let baseQuery = `
      FROM material_requisitions mr
      LEFT JOIN production_orders po ON mr.production_order_id = po.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      baseQuery += " AND mr.status = ?";
      params.push(status);
    }
    if (search) {
      baseQuery += ` AND (mr.requisition_no LIKE ? OR mr.requested_by LIKE ? OR po.order_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countRows] = await db.query(`SELECT COUNT(*) as cnt ${baseQuery}`, params);
    const total = countRows[0]?.cnt || 0;

    const rowsQuery = `SELECT mr.*, po.order_number AS production_order_no ${baseQuery} ORDER BY mr.id DESC LIMIT ? OFFSET ?`;
    const rowsParams = [...params, pageSize, offset];
    const [rows] = await db.query(rowsQuery, rowsParams);

    return Response.json({ rows, total, page, pageSize });
  } catch (err) {
    console.error("Material Requisition GET error:", err);
    return Response.json({ error: "Failed to fetch requisitions" }, { status: 500 });
  }
}

export async function POST(req) {
  let conn = null;
  try {
    const body = await req.json();
    const production_order_id = body.production_order_id || null;
    const requested_by = sanitizeString(body.requested_by || "");
    const requisition_date = sanitizeString(body.requisition_date || "");
    const status = sanitizeString(body.status || "draft");
    const remarks = sanitizeString(body.remarks || null);
    const items = Array.isArray(body.items) ? body.items : [];

    // Basic validation
    if (!requested_by || requested_by.length < 2) {
      return Response.json({ error: "Requested by must be at least 2 characters" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requisition_date)) {
      return Response.json({ error: "Invalid requisition_date (expected YYYY-MM-DD)" }, { status: 400 });
    }
    if (!["draft","submitted","approved","rejected"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    if (!items.length) {
      return Response.json({ error: "At least one item is required" }, { status: 400 });
    }
    // validate items
    const seen = new Set();
    for (const it of items) {
      const item_id = it.item_id;
      const qty = Number(it.qty);
      if (!item_id || isNaN(qty) || qty <= 0) {
        return Response.json({ error: "Each item must have item_id and qty > 0" }, { status: 400 });
      }
      if (seen.has(String(item_id))) {
        return Response.json({ error: "Duplicate items are not allowed" }, { status: 400 });
      }
      seen.add(String(item_id));
    }

    // generate requisition_no
    const datePart = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const randomPart = Math.floor(Math.random()*9000+1000);
    const requisition_no = `MR${datePart}${randomPart}`;

    // Use transaction
    if (typeof db.getConnection === "function") {
      conn = await db.getConnection();
      await conn.beginTransaction();
      const [resInsert] = await conn.query(
        `INSERT INTO material_requisitions
         (requisition_no, production_order_id, requested_by, requisition_date, status, remarks, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [requisition_no, production_order_id || null, requested_by, requisition_date, status, remarks || null]
      );
      const requisition_id = resInsert.insertId;

      const insertItemSql = `INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom) VALUES (?, ?, ?, ?)`;
      for (const it of items) {
        await conn.query(insertItemSql, [requisition_id, it.item_id, it.qty, it.uom || null]);
      }

      await conn.commit();
      conn.release();
      return Response.json({ message: "Requisition created", requisition_id, requisition_no });
    } else {
      // fallback if no getConnection (hope db.query supports transaction SQL)
      await db.query("START TRANSACTION");
      const [resInsert] = await db.query(
        `INSERT INTO material_requisitions
         (requisition_no, production_order_id, requested_by, requisition_date, status, remarks, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [requisition_no, production_order_id || null, requested_by, requisition_date, status, remarks || null]
      );
      const requisition_id = resInsert.insertId;
      for (const it of items) {
        await db.query(`INSERT INTO material_requisition_items (requisition_id, item_id, qty, uom) VALUES (?, ?, ?, ?)`, [requisition_id, it.item_id, it.qty, it.uom || null]);
      }
      await db.query("COMMIT");
      return Response.json({ message: "Requisition created", requisition_id, requisition_no });
    }
  } catch (err) {
    console.error("Material Requisition POST error:", err);
    try {
      if (conn) { await conn.rollback(); conn.release(); }
      else if (typeof db.query === "function") await db.query("ROLLBACK");
    } catch (rollErr) {
      console.error("Rollback error:", rollErr);
    }
    return Response.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
