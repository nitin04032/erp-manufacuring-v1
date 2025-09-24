"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateBOMPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_id: "",        // 🔹 product_id ❌ → item_id ✅
    version: "V1",
    is_active: 1,       // 🔹 status ❌ → is_active ✅
    remarks: "",
  });
  const [components, setComponents] = useState([]);

  // Load Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (err) {
        console.error("Error fetching items", err);
      }
    };
    fetchItems();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add Component Row
  const addComponent = () => {
    setComponents([...components, { item_id: "", qty: "" }]);
  };

  // Remove Component Row
  const removeComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Handle Component Change
  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id || components.length === 0) {
      setFlash({ type: "danger", message: "Please select finished product & add at least one component." });
      return;
    }

    try {
      const res = await fetch("/api/bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, components }),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "✅ BOM Created Successfully!" });
        setForm({ item_id: "", version: "V1", is_active: 1, remarks: "" });
        setComponents([]);
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.error || "Failed to create BOM" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error while creating BOM" });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-diagram-3 text-primary"></i> Create BOM
          </h1>
          <Link href="/bom" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to BOMs
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`} role="alert">
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* BOM Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Finished Product */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Finished Product *</label>
            <select
              name="item_id"
              className="form-select"
              value={form.item_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Finished Product</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} ({item.item_code})
                </option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div className="col-md-3 mb-3">
            <label className="form-label">Version</label>
            <input
              type="text"
              name="version"
              className="form-control"
              value={form.version}
              onChange={handleChange}
              required
            />
          </div>

          {/* Active Status */}
          <div className="col-md-3 mb-3">
            <label className="form-label">Status</label>
            <select
              name="is_active"
              className="form-select"
              value={form.is_active}
              onChange={handleChange}
              required
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* Remarks */}
          <div className="col-12 mb-3">
            <label className="form-label">Remarks</label>
            <textarea
              name="remarks"
              className="form-control"
              rows="2"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Optional notes..."
            ></textarea>
          </div>
        </div>

        {/* Components */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Components</h5>
            <button type="button" className="btn btn-sm btn-success" onClick={addComponent}>
              <i className="bi bi-plus-circle me-2"></i> Add Component
            </button>
          </div>
          <div className="card-body">
            {components.length === 0 && <p className="text-muted">No components added yet</p>}
            {components.map((comp, index) => (
              <div key={index} className="row align-items-end mb-3">
                {/* Item */}
                <div className="col-md-5">
                  <label className="form-label">Item</label>
                  <select
                    className="form-select"
                    value={comp.item_id}
                    onChange={(e) => handleComponentChange(index, "item_id", e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} ({item.item_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div className="col-md-3">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={comp.qty}
                    onChange={(e) => handleComponentChange(index, "qty", e.target.value)}
                    step="0.001"
                    min="0.001"
                    required
                  />
                </div>

                {/* Remove Button */}
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-danger mt-4"
                    onClick={() => removeComponent(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-check-circle me-2"></i>Create BOM
        </button>
      </form>
    </div>
  );
}
