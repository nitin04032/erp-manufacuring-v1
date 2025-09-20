"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        } else {
          setFlash({ type: "danger", message: "Item not found." });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error fetching item details." });
      }
    };
    fetchItem();
  }, [id]);

  if (!item) {
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

  // Helper functions
  const showOrNA = (val, fallback = "Not specified") =>
    val && val.trim() !== "" ? val : fallback;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-box text-primary"></i> Item Details:{" "}
            {item.item_name}
          </h1>
          <div>
            <Link href="/items" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-2"></i> Back to List
            </Link>
            <Link href={`/items/${id}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-2"></i> Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Item Info */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Item Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Item Code */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Item Code</label>
                  <p className="form-control-plaintext">{item.item_code}</p>
                </div>

                {/* Item Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Item Name</label>
                  <p className="form-control-plaintext">{item.item_name}</p>
                </div>

                {/* Description */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <p className="form-control-plaintext">
                    {showOrNA(item.description, "No description provided")
                      .split("\n")
                      .map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </p>
                </div>

                {/* Unit */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Unit</label>
                  <p className="form-control-plaintext">{item.unit}</p>
                </div>

                {/* Category */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Category</label>
                  <p className="form-control-plaintext">
                    {showOrNA(item.category)}
                  </p>
                </div>

                {/* Reorder Level */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Reorder Level</label>
                  <p className="form-control-plaintext">
                    {Number(item.reorder_level).toFixed(2)}
                  </p>
                </div>

                {/* Standard Rate */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Standard Rate</label>
                  <p className="form-control-plaintext">
                    ₹{Number(item.standard_rate).toFixed(2)}
                  </p>
                </div>
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
                      item.status === "active" ? "success" : "secondary"
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </p>
              </div>

              {item.created_at && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Created</label>
                  <p className="form-control-plaintext">
                    {new Date(item.created_at).toLocaleString()}
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
