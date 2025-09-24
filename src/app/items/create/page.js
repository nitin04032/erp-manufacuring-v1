"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    item_type: "raw_material",
    item_category: "",
    uom: "pcs",
    hsn_code: "",
    gst_rate: 0,
    purchase_rate: 0,
    sale_rate: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    reorder_level: 0,
    status: "active",
  });

  const [flash, setFlash] = useState({ type: "", message: "" });

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Item created successfully!" });
        setTimeout(() => router.push("/items"), 1200);
      } else {
        const errorData = await res.json();
        setFlash({
          type: "danger",
          message: errorData.error || "Failed to create item.",
        });
      }
    } catch {
      setFlash({ type: "danger", message: "Server error while creating item." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-plus-circle text-primary"></i> Create Item
          </h1>
          <Link href="/items" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to List
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
          {flash.type === "danger" && <i className="bi bi-exclamation-triangle me-2"></i>}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Item Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Item Code */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item Code *</label>
                    <input
                      type="text"
                      name="item_code"
                      className="form-control"
                      value={formData.item_code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Item Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item Name *</label>
                    <input
                      type="text"
                      name="item_name"
                      className="form-control"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Item Type */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item Type *</label>
                    <select
                      name="item_type"
                      className="form-select"
                      value={formData.item_type}
                      onChange={handleChange}
                    >
                      <option value="raw_material">Raw Material</option>
                      <option value="semi_finished">Semi Finished</option>
                      <option value="finished_goods">Finished Goods</option>
                      <option value="consumable">Consumable</option>
                      <option value="service">Service</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="item_category"
                      className="form-control"
                      value={formData.item_category}
                      onChange={handleChange}
                    />
                  </div>

                  {/* UOM */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Unit (UOM) *</label>
                    <select
                      name="uom"
                      className="form-select"
                      value={formData.uom}
                      onChange={handleChange}
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilogram</option>
                      <option value="ltr">Liter</option>
                      <option value="mtr">Meter</option>
                      <option value="box">Box</option>
                    </select>
                  </div>

                  {/* HSN Code */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">HSN Code</label>
                    <input
                      type="text"
                      name="hsn_code"
                      className="form-control"
                      value={formData.hsn_code}
                      onChange={handleChange}
                    />
                  </div>

                  {/* GST Rate */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">GST Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="gst_rate"
                      className="form-control"
                      value={formData.gst_rate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Purchase Rate */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Purchase Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      name="purchase_rate"
                      className="form-control"
                      value={formData.purchase_rate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Sale Rate */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sale Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sale_rate"
                      className="form-control"
                      value={formData.sale_rate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Min / Max Stock */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Minimum Stock</label>
                    <input
                      type="number"
                      name="minimum_stock"
                      className="form-control"
                      value={formData.minimum_stock}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Maximum Stock</label>
                    <input
                      type="number"
                      name="maximum_stock"
                      className="form-control"
                      value={formData.maximum_stock}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Reorder Level */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Reorder Level</label>
                    <input
                      type="number"
                      name="reorder_level"
                      className="form-control"
                      value={formData.reorder_level}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status + Submit */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Status</h5>
              </div>
              <div className="card-body">
                <select
                  name="status"
                  className="form-select mb-3"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i> Create Item
                  </button>
                  <Link href="/items" className="btn btn-outline-secondary">
                    <i className="bi bi-x-circle me-2"></i> Cancel
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
