"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function StockAdjustmentPage() {
  const [formData, setFormData] = useState({
    warehouse_id: "",
    item_id: "",
    adjustment_type: "IN",
    qty: "",
    reason: "",
  });

  const [flash, setFlash] = useState({ type: "", message: "" });
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Items + Warehouses load karo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, warehousesRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/warehouses"),
        ]);

        if (!itemsRes.ok || !warehousesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        setItems(await itemsRes.json());
        setWarehouses(await warehousesRes.json());
      } catch (error) {
        console.error("Error loading data:", error);
        setFlash({ type: "danger", message: "Failed to load items/warehouses." });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.item_id || !formData.warehouse_id || !formData.adjustment_type || !formData.qty) {
      setFlash({ type: "danger", message: "Please fill all required fields." });
      return;
    }

    try {
      const res = await fetch("/api/stock-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFlash({ type: "success", message: `✅ Adjustment Done: ${data.adjustment_number}` });
        setFormData({ warehouse_id: "", item_id: "", adjustment_type: "IN", qty: "", reason: "" });
      } else {
        setFlash({ type: "danger", message: data.error || "Error processing adjustment." });
      }
    } catch (err) {
      console.error("Error:", err);
      setFlash({ type: "danger", message: "Something went wrong." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-arrow-up-down text-primary"></i> Stock Adjustment
          </h1>
          <Link href="/current-stock" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to Stock
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`} role="alert">
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          {/* Left Form */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Adjustment Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Warehouse */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Warehouse *</label>
                    <select
                      name="warehouse_id"
                      value={formData.warehouse_id}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.warehouse_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item *</label>
                    <select
                      name="item_id"
                      value={formData.item_id}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_code} - {item.item_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Adjustment Type */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Adjustment Type *</label>
                    <select
                      name="adjustment_type"
                      value={formData.adjustment_type}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="IN">Stock IN (Add)</option>
                      <option value="OUT">Stock OUT (Reduce)</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      name="qty"
                      value={formData.qty}
                      onChange={handleChange}
                      className="form-control"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Reason for adjustment..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Instructions */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Instructions</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h6>
                    <i className="bi bi-info-circle me-2"></i>Stock Adjustment Guide
                  </h6>
                  <ul className="mb-0 small">
                    <li><strong>Stock IN:</strong> Increases inventory (found items, corrections)</li>
                    <li><strong>Stock OUT:</strong> Reduces inventory (damage, theft, corrections)</li>
                    <li>Always provide clear remarks for audit purposes</li>
                  </ul>
                </div>

                <hr />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>Process Adjustment
                  </button>
                  <Link href="/current-stock" className="btn btn-outline-secondary">
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
