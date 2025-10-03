"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateCustomer() {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_type: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    gst_number: "",
    pan_number: "",
    contact_person: "",
    credit_limit: 0,
    credit_days: 0,
    status: "active",
  });

  const [flash, setFlash] = useState({ success: "", error: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save customer");
      setFlash({ success: "Customer saved successfully!", error: "" });
      setFormData({
        customer_name: "",
        customer_type: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        gst_number: "",
        pan_number: "",
        contact_person: "",
        credit_limit: 0,
        credit_days: 0,
        status: "active",
      });
    } catch (err) {
      setFlash({ success: "", error: err.message });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <h2>Create Customer</h2>
        <Link href="/customers" className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
      </div>

      {/* Flash Messages */}
      {flash.success && (
        <div className="alert alert-success alert-dismissible fade show">
          {flash.success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ ...flash, success: "" })}
          ></button>
        </div>
      )}
      {flash.error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {flash.error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ ...flash, error: "" })}
          ></button>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Name & Type */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Customer Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Customer Type <span className="text-danger">*</span>
                </label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                  <option value="distributor">Distributor</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows="2"
              />
            </div>

            {/* City, State, Pincode, Country */}
            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* GST, PAN, Contact Person */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Credit Limit, Credit Days, Status */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Credit Limit</label>
                <input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  className="form-control"
                  step="0.01"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Credit Days</label>
                <input
                  type="number"
                  name="credit_days"
                  value={formData.credit_days}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save"></i> Save Customer
              </button>
              <Link href="/customers" className="btn btn-light ms-2">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
