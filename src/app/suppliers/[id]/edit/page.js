"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditSupplierPage() {
  const { id } = useParams();
  const router = useRouter();

  const [supplier, setSupplier] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch supplier by ID
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await fetch(`/api/suppliers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSupplier(data);
        } else {
          setFlash({ type: "danger", message: "Supplier not found." });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error loading supplier." });
      }
    };
    fetchSupplier();
  }, [id]);

  if (!supplier) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // Handle input change
  const handleChange = (field, value) => {
    setSupplier({ ...supplier, [field]: value });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplier.supplier_name || !supplier.supplier_code || !supplier.contact_person) {
      setFlash({ type: "danger", message: "Supplier Name, Code & Contact Person are required." });
      return;
    }

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(supplier),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Supplier updated successfully!" });
        setTimeout(() => router.push(`/suppliers/${id}`), 1200);
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.message || "Error updating supplier." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-pencil text-primary"></i> Edit Supplier
          </h1>
          <Link href={`/suppliers/${id}`} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to Details
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
                    { id: "supplier_code", label: "Supplier Code", required: true },
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
                        required={field.required}
                        value={supplier[field.id] || ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Address Information</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {[
                    { id: "address", label: "Address", type: "textarea", rows: 3 },
                    { id: "city", label: "City" },
                    { id: "state", label: "State" },
                    { id: "country", label: "Country" },
                    { id: "pincode", label: "Pincode" },
                  ].map((field, i) => (
                    <div className={`${field.type === "textarea" ? "col-12" : "col-md-6"} mb-3`} key={i}>
                      <label htmlFor={field.id} className="form-label">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={field.id}
                          className="form-control"
                          rows={field.rows}
                          value={supplier[field.id] || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        ></textarea>
                      ) : (
                        <input
                          type="text"
                          id={field.id}
                          className="form-control"
                          value={supplier[field.id] || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status + Buttons */}
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
                    value={supplier.status || "active"}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <hr />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i> Update Supplier
                  </button>
                  <Link href={`/suppliers/${id}`} className="btn btn-outline-secondary">
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
