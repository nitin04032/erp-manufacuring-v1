"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LocationDetailsPage() {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/locations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
        } else {
          setFlash({ type: "danger", message: "Location not found." });
        }
      } catch (error) {
        setFlash({ type: "danger", message: "Failed to load location details." });
      }
    };
    if (id) fetchLocation();
  }, [id]);

  if (!location) {
    return (
      <div className="container-fluid py-5 text-center">
        <i className="bi bi-geo-alt fs-1 text-muted"></i>
        <h4 className="mt-3 text-muted">Loading location details...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-geo-alt text-primary"></i>{" "}
            Location Details: {location.location_name}
          </h1>
          <div>
            <Link href="/locations" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-2"></i> Back to List
            </Link>
            <Link href={`/locations/${id}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil me-2"></i> Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.type === "danger" && (
            <i className="bi bi-exclamation-triangle me-2"></i>
          )}
          {flash.type === "success" && (
            <i className="bi bi-check-circle me-2"></i>
          )}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Details */}
      <div className="row">
        {/* Left Column */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Location Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Location Code</label>
                  <p className="form-control-plaintext">
                    {location.location_code}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Location Name</label>
                  <p className="form-control-plaintext">
                    {location.location_name}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Warehouse ID</label>
                  <p className="form-control-plaintext">
                    {location.warehouse_id || "Not provided"}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <p className="form-control-plaintext">
                    {location.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
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
                      location.status === "active" ? "success" : "secondary"
                    }`}
                  >
                    {location.status.charAt(0).toUpperCase() +
                      location.status.slice(1)}
                  </span>
                </p>
              </div>

              {location.created_at && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Created</label>
                  <p className="form-control-plaintext">
                    {new Date(location.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
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
