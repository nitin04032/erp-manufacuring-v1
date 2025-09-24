"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function WarehousesPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState([]);

  // Fetch warehouses
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      setWarehouses([]);
    }
  };

  // ✅ Delete warehouse
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });

      if (res.ok) {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        setFlash({ type: "success", message: "Warehouse deleted successfully!" });
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.error || "Delete failed" });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error while deleting." });
    }
  };

  const filteredWarehouses = warehouses.filter((w) => {
    return (
      (status ? w.status === status : true) &&
      (search
        ? w.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
          w.contact_person.toLowerCase().includes(search.toLowerCase())
        : true)
    );
  });

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-building text-primary"></i> Warehouses
          </h1>
          <Link href="/warehouses/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Add Warehouse
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
          {flash.type === "danger" && (
            <i className="bi bi-exclamation-triangle me-2"></i>
          )}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="search" className="form-label">Search</label>
                  <input
                    type="text"
                    id="search"
                    className="form-control"
                    placeholder="Search warehouses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="button" className="btn btn-outline-primary w-100">
                    <i className="bi bi-funnel"></i> Filter
                  </button>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setStatus("");
                      setSearch("");
                    }}
                  >
                    <i className="bi bi-x-circle"></i> Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {filteredWarehouses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-building fs-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No warehouses found</h4>
                  <p className="text-muted">Start by adding your first warehouse</p>
                  <Link href="/warehouses/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i> Add Warehouse
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Warehouse Name</th>
                        <th>Description</th>
                        <th>Location</th>
                        <th>Contact Person</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWarehouses.map((w) => (
                        <tr key={w.id}>
                          <td><strong>{w.warehouse_code}</strong></td>
                          <td>{w.warehouse_name}</td>
                          <td>{w.description}</td>
                          <td>{w.city}, {w.state}</td>
                          <td>{w.contact_person}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                w.status === "active" ? "success" : "secondary"
                              }`}
                            >
                              {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/warehouses/${w.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/warehouses/${w.id}/edit`}
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                className="btn btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDelete(w.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
