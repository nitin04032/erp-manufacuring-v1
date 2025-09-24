"use client";
import { useState } from "react";
import Link from "next/link";

export default function CreateSupplierPage() {
  const [form, setForm] = useState({
    supplier_name: "",
    supplier_code: "",
    contact_person: "",
    email: "",
    phone: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    status: "active",
  });

  const [flash, setFlash] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier_name || !form.contact_person) {
      setFlash({ type: "danger", message: "Supplier Name and Contact Person are required." });
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Supplier created successfully!" });
        setForm({
          supplier_name: "",
          supplier_code: "",
          contact_person: "",
          email: "",
          phone: "",
          gst_number: "",
          address: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          status: "active",
        });
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.message || "Error creating supplier." });
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
            <i className="bi bi-plus-circle text-primary"></i> Create Supplier
          </h1>
          <Link href="/suppliers" className="btn btn-outline-secondary">
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
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          {/* Basic Info */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Basic Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {[
                    { id: "supplier_name", label: "Supplier Name", required: true },
                    { id: "supplier_code", label: "Supplier Code", placeholder: "Auto-generated if empty" },
                    { id: "contact_person", label: "Contact Person", required: true },
                    { id: "email", label: "Email", type: "email" },
                    { id: "phone", label: "Phone" },
                    { id: "gst_number", label: "GST Number" },
                  ].map((field, i) => (
                    <div className="col-md-6 mb-3" key={i}>
                      <label htmlFor={field.id} className="form-label">
                        {field.label} {field.required && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type={field.type || "text"}
                        id={field.id}
                        className="form-control"
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        value={form[field.id]}
                        onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                      />
                    </div>
                  ))}
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
                      <label htmlFor={field} className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
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

          {/* Status + Submit */}
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
                    <i className="bi bi-check-circle me-2"></i>Create Supplier
                  </button>
                  <Link href="/suppliers" className="btn btn-outline-secondary">
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
