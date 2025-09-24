"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch supplier details
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
      } catch (error) {
        setFlash({ type: "danger", message: "Error fetching supplier details." });
      }
    };
    fetchSupplier();
  }, [id]);

  if (!supplier) {
    return (
      <div className="container-fluid py-5 text-center">
        {flash.message ? (
          <div className={`alert alert-${flash.type}`}>{flash.message}</div>
        ) : (
          <div className="spinner-border text-primary" role="status"></div>
        )}
      </div>
    );
  }

  // Helper function for safe display
  const showOrNA = (val) => (val && val.trim() !== "" ? val : "Not provided");

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-person-badge text-primary"></i> Supplier Details:{" "}
            {supplier.supplier_name}
          </h1>
          <div>
            <Link href="/suppliers" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-2"></i> Back to List
            </Link>
            <Link href={`/suppliers/${id}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-2"></i> Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && flash.type === "success" && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i> {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

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
                  { label: "Supplier Code", value: supplier.supplier_code },
                  { label: "Supplier Name", value: supplier.supplier_name },
                  { label: "Contact Person", value: supplier.contact_person },
                  { label: "Email", value: supplier.email },
                  { label: "Phone", value: supplier.phone },
                  { label: "GST Number", value: supplier.gst_number },
                ].map((field, i) => (
                  <div className="col-md-6 mb-3" key={i}>
                    <label className="form-label fw-bold">{field.label}</label>
                    <p className="form-control-plaintext">{showOrNA(field.value)}</p>
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
                  <label className="form-label fw-bold">Address</label>
                  <p className="form-control-plaintext">
                    {showOrNA(supplier.address)?.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
                {[
                  { label: "City", value: supplier.city },
                  { label: "State", value: supplier.state },
                  { label: "Country", value: supplier.country },
                  { label: "Pincode", value: supplier.pincode },
                ].map((field, i) => (
                  <div className="col-md-6 mb-3" key={i}>
                    <label className="form-label fw-bold">{field.label}</label>
                    <p className="form-control-plaintext">{showOrNA(field.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Info */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Status & Info</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Status</label>
                <p className="form-control-plaintext">
                  <span
                    className={`badge bg-${
                      supplier.status === "active" ? "success" : "secondary"
                    }`}
                  >
                    {supplier.status.charAt(0).toUpperCase() +
                      supplier.status.slice(1)}
                  </span>
                </p>
              </div>

              {supplier.created_at && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Created</label>
                  <p className="form-control-plaintext">
                    {new Date(supplier.created_at).toLocaleString()}
                  </p>
                </div>
              )}

              {supplier.updated_at && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Last Updated</label>
                  <p className="form-control-plaintext">
                    {new Date(supplier.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
