import { db } from "@/lib/db";

// =========================
// GET - BOM Detail
// =========================
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const [bomRows] = await db.query(
      `SELECT 
          b.id, 
          b.bom_number,
          b.version, 
          b.is_active, 
          b.remarks,
          b.created_at,
          i.item_name AS product_name,
          i.item_code AS product_code
       FROM bom b
       JOIN items i ON b.item_id = i.id
       WHERE b.id = ?`,
      [id]
    );

    if (bomRows.length === 0) {
      return Response.json({ error: "❌ BOM not found" }, { status: 404 });
    }

    const bom = bomRows[0];

    const [compRows] = await db.query(
      `SELECT 
          bc.id, 
          bc.item_id, 
          bc.qty,
          i.item_code, 
          i.item_name
       FROM bom_components bc
       JOIN items i ON bc.item_id = i.id
       WHERE bc.bom_id = ?`,
      [id]
    );

    bom.components = compRows;

    return Response.json(bom);
  } catch (error) {
    console.error("❌ BOM Detail Error:", error);
    return Response.json({ error: "Failed to fetch BOM details" }, { status: 500 });
  }
}

// =========================
// PUT - Update BOM
// =========================
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { item_id, version, is_active, remarks, components } = body;

    if (!item_id || !version || !components || components.length === 0) {
      return Response.json({ error: "❌ Required fields missing" }, { status: 400 });
    }

    // Update BOM header
    await db.query(
      `UPDATE bom SET item_id=?, version=?, is_active=?, remarks=?, updated_at=NOW() WHERE id=?`,
      [item_id, version, is_active ? 1 : 0, remarks || null, id]
    );

    // Remove old components
    await db.query(`DELETE FROM bom_components WHERE bom_id=?`, [id]);

    // Insert updated components
    for (const comp of components) {
      if (!comp.item_id || !comp.qty) continue;
      await db.query(
        `INSERT INTO bom_components (bom_id, item_id, qty) VALUES (?, ?, ?)`,
        [id, comp.item_id, comp.qty]
      );
    }

    return Response.json({ message: "✅ BOM updated successfully" });
  } catch (error) {
    console.error("❌ BOM Update Error:", error);
    return Response.json({ error: "Failed to update BOM" }, { status: 500 });
  }
}

// =========================
// DELETE - Remove BOM
// =========================
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await db.query(`DELETE FROM bom_components WHERE bom_id=?`, [id]);
    await db.query(`DELETE FROM bom WHERE id=?`, [id]);

    return Response.json({ message: "🗑️ BOM deleted successfully" });
  } catch (error) {
    console.error("❌ BOM Delete Error:", error);
    return Response.json({ error: "Failed to delete BOM" }, { status: 500 });
  }
}
