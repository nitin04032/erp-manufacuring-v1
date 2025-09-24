"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, [status, search]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`/api/invoices?status=${status}&search=${search}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-receipt text-primary"></i> Invoices
          </h1>
          <Link href="/invoice/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchInvoices();
            }}
            className="row g-3"
          >
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-outline-primary w-100">
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
                  fetchInvoices();
                }}
              >
                <i className="bi bi-x-circle"></i> Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {invoices.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt fs-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No invoices found</h4>
              <p className="text-muted">Create your first invoice to get started</p>
              <Link href="/invoice/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Create Invoice
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <strong>{inv.invoice_number}</strong>
                      </td>
                      <td>
                        {new Date(inv.invoice_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>{inv.customer_name}</td>
                      <td>₹ {Number(inv.total_amount).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "sent"
                              ? "info"
                              : inv.status === "draft"
                              ? "secondary"
                              : "danger"
                          }`}
                        >
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/invoice/${inv.id}`}
                            className="btn btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link
                            href={`/invoice/${inv.id}/edit`}
                            className="btn btn-outline-secondary"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <Link
                            href={`/invoice/${inv.id}/print`}
                            target="_blank"
                            className="btn btn-outline-success"
                            title="Print"
                          >
                            <i className="bi bi-printer"></i>
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
  );
}
