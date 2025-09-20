"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuppliersPage() {
  // Flash messages
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Filters
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Suppliers data
  const [suppliers, setSuppliers] = useState([]);

  // Fetch suppliers (dummy API simulation)
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/suppliers");
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data);
        } else {
          setSuppliers([]);
        }
      } catch (error) {
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  // Apply filters
  const filteredSuppliers = suppliers.filter((s) => {
    return (
      (status ? s.status === status : true) &&
      (search
        ? s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
          s.contact_person.toLowerCase().includes(search.toLowerCase())
        : true)
    );
  });

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-people text-primary"></i> Suppliers
          </h1>
          <Link href="/suppliers/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Add Supplier
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.type === "success" && (
            <i className="bi bi-check-circle me-2"></i>
          )}
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
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
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
                  <label htmlFor="search" className="form-label">
                    Search
                  </label>
                  <input
                    type="text"
                    id="search"
                    className="form-control"
                    placeholder="Search suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-primary d-block w-100"
                  >
                    <i className="bi bi-funnel"></i> Filter
                  </button>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-block w-100"
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

      {/* Suppliers Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {filteredSuppliers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people fs-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No suppliers found</h4>
                  <p className="text-muted">Start by adding your first supplier</p>
                  <Link href="/suppliers/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i> Add Supplier
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Supplier Name</th>
                        <th>Contact Person</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.supplier_code}</strong>
                          </td>
                          <td>{s.supplier_name}</td>
                          <td>{s.contact_person}</td>
                          <td>{s.phone}</td>
                          <td>{s.email}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                s.status === "active" ? "success" : "secondary"
                              }`}
                            >
                              {s.status.charAt(0).toUpperCase() +
                                s.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/suppliers/${s.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/suppliers/${s.id}/edit`}
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
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
