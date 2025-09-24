"use client";
import { useState } from "react";
import Link from "next/link";

export default function CreateWarehousePage() {
  const [form, setForm] = useState({
    warehouse_name: "",
    warehouse_code: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    contact_person: "",
    phone: "",
    email: "",
    status: "active",
  });

  const [flash, setFlash] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.warehouse_name || !form.warehouse_code) {
      setFlash({ type: "danger", message: "Warehouse Name and Code are required." });
      return;
    }

    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Warehouse created successfully!" });
        setForm({
          warehouse_name: "",
          warehouse_code: "",
          description: "",
          address: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          contact_person: "",
          phone: "",
          email: "",
          status: "active",
        });
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.message || "Error creating warehouse." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Please try again later." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-plus-circle text-primary"></i> Create Warehouse
          </h1>
          <Link href="/warehouses" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.type === "danger" && <i className="bi bi-exclamation-triangle me-2"></i>}
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          {/* Left Section */}
          <div className="col-md-8">
            {/* Warehouse Details */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Warehouse Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {[
                    { id: "warehouse_name", label: "Warehouse Name", required: true },
                    { id: "warehouse_code", label: "Warehouse Code", required: true },
                    { id: "contact_person", label: "Contact Person" },
                    { id: "phone", label: "Phone" },
                    { id: "email", label: "Email", type: "email" },
                  ].map((field, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <label htmlFor={field.id} className="form-label">
                        {field.label} {field.required && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type={field.type || "text"}
                        id={field.id}
                        className="form-control"
                        required={field.required}
                        value={form[field.id]}
                        onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      />
                    </div>
                  ))}

                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Address Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      id="address"
                      className="form-control"
                      rows="3"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    ></textarea>
                  </div>
                  {["city", "state", "country", "pincode"].map((field, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <label htmlFor={field} className="form-label">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        id={field}
                        className="form-control"
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Status</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <hr />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>Create Warehouse
                  </button>
                  <Link href="/warehouses" className="btn btn-outline-secondary">
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
