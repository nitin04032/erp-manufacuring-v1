"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    item_name: "",
    item_code: "",
    description: "",
    unit: "",
    category: "",
    reorder_level: 0,
    standard_rate: 0,
    status: "active",
  });

  const [flash, setFlash] = useState({ type: "", message: "" });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
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
        setTimeout(() => {
          router.push("/items");
        }, 1500);
      } else {
        const errorData = await res.json();
        setFlash({
          type: "danger",
          message: errorData.error || "Failed to create item.",
        });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Error while creating item." });
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
      <form onSubmit={handleSubmit} className="needs-validation">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Item Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Item Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_name" className="form-label">
                      Item Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      id="item_name"
                      className="form-control"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Item Code */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_code" className="form-label">
                      Item Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_code"
                      id="item_code"
                      className="form-control"
                      value={formData.item_code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="unit" className="form-label">
                      Unit <span className="text-danger">*</span>
                    </label>
                    <select
                      name="unit"
                      id="unit"
                      className="form-select"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilogram</option>
                      <option value="ltr">Liter</option>
                      <option value="mtr">Meter</option>
                      <option value="box">Box</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      id="category"
                      className="form-control"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Reorder Level */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="reorder_level" className="form-label">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      name="reorder_level"
                      id="reorder_level"
                      className="form-control"
                      min="0"
                      value={formData.reorder_level}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Standard Rate */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="standard_rate" className="form-label">
                      Standard Rate
                    </label>
                    <input
                      type="number"
                      name="standard_rate"
                      id="standard_rate"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={formData.standard_rate}
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
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <hr />

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
