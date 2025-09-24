"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateProductionOrder() {
  const [boms, setBoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    bom_id: "",
    fg_item_id: "",
    warehouse_id: "",
    order_qty: "",
    planned_start_date: "",
    planned_end_date: "",
    remarks: "",
  });

  // Fetch BOMs and Warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bomRes, whRes] = await Promise.all([
          fetch("/api/bom"),
          fetch("/api/warehouses"),
        ]);
        if (bomRes.ok) setBoms(await bomRes.json());
        if (whRes.ok) setWarehouses(await whRes.json());
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, []);

  // When BOM changes, update fg_item_id automatically
  const handleBomChange = (e) => {
    const bomId = e.target.value;
    setForm({ ...form, bom_id: bomId });

    const selectedBom = boms.find((b) => b.id == bomId);
    if (selectedBom) {
      setForm((prev) => ({ ...prev, fg_item_id: selectedBom.item_id }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/production-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Production Order Created");
        window.location.href = "/production-orders";
      } else {
        const err = await res.json();
        alert("❌ " + (err.error || "Error creating order"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-plus-circle text-primary"></i> Create Production Order
          </h1>
          <Link href="/production-orders" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to Orders
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Production Order Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* BOM */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select BOM *</label>
                    <select
                      name="bom_id"
                      className="form-select"
                      value={form.bom_id}
                      onChange={handleBomChange}
                      required
                    >
                      <option value="">Select BOM</option>
                      {boms.map((bom) => (
                        <option key={bom.id} value={bom.id}>
                          {bom.bom_number} - {bom.fg_name} ({bom.fg_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FG Product (auto from BOM) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Finished Product</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        form.fg_item_id
                          ? boms.find((b) => b.item_id == form.fg_item_id)?.fg_name
                          : ""
                      }
                      disabled
                    />
                  </div>

                  {/* Warehouse */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Production Warehouse *</label>
                    <select
                      name="warehouse_id"
                      className="form-select"
                      value={form.warehouse_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.warehouse_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Quantity */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Order Quantity *</label>
                    <input
                      type="number"
                      name="order_qty"
                      className="form-control"
                      value={form.order_qty}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Planned Dates */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Planned Start Date *</label>
                    <input
                      type="date"
                      name="planned_start_date"
                      className="form-control"
                      value={form.planned_start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Planned End Date</label>
                    <input
                      type="date"
                      name="planned_end_date"
                      className="form-control"
                      value={form.planned_end_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      name="remarks"
                      className="form-control"
                      rows="3"
                      value={form.remarks}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Instructions</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info small">
                  <h6>
                    <i className="bi bi-info-circle me-2"></i>Production Planning
                  </h6>
                  <ul>
                    <li>Select a BOM (finished product is auto-selected)</li>
                    <li>Choose the production warehouse</li>
                    <li>Set realistic start and end dates</li>
                    <li>Ensure raw materials are available</li>
                  </ul>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>Create Order
                  </button>
                  <Link href="/production-orders" className="btn btn-outline-secondary">
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
