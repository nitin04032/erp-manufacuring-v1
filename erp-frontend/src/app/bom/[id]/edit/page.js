"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditBOMPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_id: "",
    version: "V1",
    is_active: 1,
    remarks: "",
  });
  const [components, setComponents] = useState([]);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Load items + existing BOM
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, bomRes] = await Promise.all([
          fetch("/api/items"),
          fetch(`/api/bom/${id}`)
        ]);
        if (itemsRes.ok) setItems(await itemsRes.json());
        if (bomRes.ok) {
          const bom = await bomRes.json();
          setForm({
            item_id: bom.item_id || "",
            version: bom.version || "V1",
            is_active: bom.is_active,
            remarks: bom.remarks || "",
          });
          setComponents(bom.components || []);
        }
      } catch (err) {
        console.error("Error loading data", err);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Handle changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };
  const addComponent = () => setComponents([...components, { item_id: "", qty: "" }]);
  const removeComponent = (i) => setComponents(components.filter((_, idx) => idx !== i));

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/bom/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, components }),
      });
      if (res.ok) {
        setFlash({ type: "success", message: "✅ BOM updated!" });
        setTimeout(() => router.push("/bom"), 1500);
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.error || "Update failed" });
      }
    } catch {
      setFlash({ type: "danger", message: "Server error" });
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3"><i className="bi bi-pencil text-primary"></i> Edit BOM</h1>
        <Link href="/bom" className="btn btn-outline-secondary">Back</Link>
      </div>

      {flash.message && (
        <div className={`alert alert-${flash.type}`}>{flash.message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Finished Product */}
          <div className="col-md-6 mb-3">
            <label>Finished Product</label>
            <select className="form-select" name="item_id" value={form.item_id} onChange={handleChange} required>
              <option value="">Select Product</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.item_name} ({it.item_code})</option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div className="col-md-3 mb-3">
            <label>Version</label>
            <input type="text" name="version" value={form.version} onChange={handleChange} className="form-control" />
          </div>

          {/* Status */}
          <div className="col-md-3 mb-3">
            <label>Status</label>
            <select name="is_active" value={form.is_active} onChange={handleChange} className="form-select">
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-3">
          <label>Remarks</label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} className="form-control"></textarea>
        </div>

        {/* Components */}
        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between">
            <span>Components</span>
            <button type="button" className="btn btn-sm btn-success" onClick={addComponent}>
              <i className="bi bi-plus-circle"></i> Add
            </button>
          </div>
          <div className="card-body">
            {components.length === 0 && <p>No components</p>}
            {components.map((c, i) => (
              <div className="row mb-2" key={i}>
                <div className="col-md-6">
                  <select className="form-select" value={c.item_id} onChange={(e) => handleComponentChange(i, "item_id", e.target.value)} required>
                    <option value="">Select Item</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>{it.item_name} ({it.item_code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input type="number" className="form-control" value={c.qty} onChange={(e) => handleComponentChange(i, "qty", e.target.value)} step="0.001" />
                </div>
                <div className="col-md-2">
                  <button type="button" className="btn btn-danger" onClick={() => removeComponent(i)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Update BOM</button>
      </form>
    </div>
  );
}
