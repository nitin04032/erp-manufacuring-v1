"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [flashMessage, setFlashMessage] = useState({ success: "", error: "" });

  // ✅ Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        setFlashMessage({ success: "", error: "Error loading customers" });
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCustomers(customers.filter((c) => c.id !== id));
        setFlashMessage({ success: "Customer deleted successfully!", error: "" });
      } else {
        const data = await res.json();
        setFlashMessage({ success: "", error: data.error || "Delete failed" });
      }
    } catch (err) {
      setFlashMessage({ success: "", error: "Server error" });
    }
  };

  // ✅ Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      search === "" ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "" || c.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <h2>Customers</h2>
        <Link href="/customers/create" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Create Customer
        </Link>
      </div>

      {/* Flash Messages */}
      {flashMessage.success && (
        <div className="alert alert-success alert-dismissible fade show">
          {flashMessage.success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlashMessage({ ...flashMessage, success: "" })}
          ></button>
        </div>
      )}
      {flashMessage.error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {flashMessage.error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlashMessage({ ...flashMessage, error: "" })}
          ></button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-header">
          <form className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <button type="button" className="btn btn-secondary me-2">
                <i className="bi bi-search"></i> Search
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Orders</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.customer_code}</td>
                        <td>
                          <Link href={`/customers/${c.id}`}>
                            {c.customer_name}
                          </Link>
                        </td>
                        <td>{c.customer_type}</td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.city}</td>
                        <td>
                          <span className="badge bg-info">
                            {c.total_orders ?? 0}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${
                              c.status === "active" ? "success" : "danger"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              href={`/customers/${c.id}`}
                              className="btn btn-info"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                            <Link
                              href={`/customers/${c.id}/edit`}
                              className="btn btn-warning"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(c.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
