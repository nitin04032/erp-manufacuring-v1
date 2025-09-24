import { db } from "@/lib/db";

// =========================
// GET - List all BOMs
// =========================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id, 
        b.bom_number,
        b.item_id,         -- ✅ add this for linking to FG item later
        b.version, 
        b.is_active, 
        b.remarks,
        b.created_at,
        i.item_name AS fg_name, 
        i.item_code AS fg_code,
        (
          SELECT COUNT(*) 
          FROM bom_components bc 
          WHERE bc.bom_id = b.id
        ) AS components_count
      FROM bom b
      JOIN items i ON b.item_id = i.id
      ORDER BY b.id DESC
    `);

    return Response.json(rows);
  } catch (error) {
    console.error("❌ BOM GET Error:", error);
    return Response.json({ error: "Failed to fetch BOMs" }, { status: 500 });
  }
}

// =========================
// POST - Create BOM
// =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { item_id, version, is_active, remarks, components } = body;

    if (!item_id || !version || !components || components.length === 0) {
      return Response.json(
        { error: "❌ Finished product and components are required" },
        { status: 400 }
      );
    }

    // 🔹 Generate BOM Number
    const bom_number = `BOM${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`;

    // 🔹 Insert BOM Header
    const [result] = await db.query(
      `INSERT INTO bom (bom_number, item_id, version, is_active, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [bom_number, item_id, version, is_active ? 1 : 0, remarks || null]
    );

    const bom_id = result.insertId;

    // 🔹 Insert BOM Components
    for (const comp of components) {
      if (!comp.item_id || !comp.qty) continue;
      await db.query(
        `INSERT INTO bom_components (bom_id, item_id, qty)
         VALUES (?, ?, ?)`,
        [bom_id, comp.item_id, comp.qty]
      );
    }

    return Response.json({
      message: "✅ BOM created successfully",
      bom_id,
      bom_number,
    });
  } catch (error) {
    console.error("❌ BOM POST Error:", error);
    return Response.json({ error: "Failed to create BOM" }, { status: 500 });
  }
}
