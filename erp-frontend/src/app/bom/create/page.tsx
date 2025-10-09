"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Interfaces
interface Item {
  id: number;
  item_name: string;
  item_code: string;
}

interface BOMComponent {
  item_id: string;
  qty: string;
}

interface FlashMessage {
  type: 'success' | 'danger' | '';
  message: string;
}

export default function CreateBOMPage() {
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({
    item_id: "",
    version: "V1",
    is_active: 1,
    remarks: "",
  });
  const [components, setComponents] = useState<BOMComponent[]>([]);

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
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add Component Row
  const addComponent = () => {
    setComponents([...components, { item_id: "", qty: "" }]);
  };

  // Remove Component Row
  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Handle Component Change
  const handleComponentChange = (index: number, field: keyof BOMComponent, value: string) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  // Submit Form
  const handleSubmit = async (e: FormEvent) => {
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
      <AnimatePresence>
        {flash.message && (
          <motion.div
            className={`alert alert-${flash.type} alert-dismissible fade show`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
          >
            {flash.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setFlash({ type: "", message: "" })}
            ></button>
          </motion.div>
        )}
      </AnimatePresence>

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
              rows={2}
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
            <AnimatePresence>
              {components.map((comp, index) => (
                <motion.div
                  key={index}
                  className="row align-items-end mb-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="bi bi-check-circle me-2"></i>Create BOM
        </motion.button>
      </form>
    </div>
  );
}