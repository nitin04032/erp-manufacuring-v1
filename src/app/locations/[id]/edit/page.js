"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditLocationPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    location_name: "",
    location_code: "",
    warehouse_id: "",
    description: "",
    status: "active",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Fetch location + warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, whRes] = await Promise.all([
          fetch(`/api/locations/${id}`),
          fetch("/api/warehouses"),
        ]);

        if (locRes.ok) {
          const locData = await locRes.json();
          setForm({
            location_name: locData.location_name || "",
            location_code: locData.location_code || "",
            warehouse_id: locData.warehouse_id || "",
            description: locData.description || "",
            status: locData.status || "active",
          });
        } else {
          setFlash({ type: "danger", message: "Location not found." });
        }

        if (whRes.ok) {
          const whData = await whRes.json();
          setWarehouses(whData);
        }
      } catch (error) {
        setFlash({ type: "danger", message: "Failed to load data." });
      }
    };
    if (id) fetchData();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlash({ type: "", message: "" });

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Location updated successfully!" });
        setTimeout(() => router.push(`/locations/${id}`), 1500);
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.message || "Failed to update location" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-pencil text-primary"></i> Edit Location
          </h1>
          <Link href={`/locations/${id}`} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to Details
          </Link>
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

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          {/* Left Side */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Location Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Location Name */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="location_name" className="form-label">
                      Location Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="location_name"
                      id="location_name"
                      className="form-control"
                      required
                      value={form.location_name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Location Code */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="location_code" className="form-label">
                      Location Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="location_code"
                      id="location_code"
                      className="form-control"
                      required
                      value={form.location_code}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Warehouse */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="warehouse_id" className="form-label">
                      Warehouse <span className="text-danger">*</span>
                    </label>
                    <select
                      name="warehouse_id"
                      id="warehouse_id"
                      className="form-select"
                      required
                      value={form.warehouse_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.warehouse_name}
                        </option>
                      ))}
                    </select>
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
                      value={form.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Status</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    name="status"
                    id="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <hr />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="bi bi-check-circle me-2"></i>
                    {loading ? "Updating..." : "Update Location"}
                  </button>
                  <Link href={`/locations/${id}`} className="btn btn-outline-secondary">
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
