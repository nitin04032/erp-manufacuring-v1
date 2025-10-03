"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function StockLedgerPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    transaction_type: "",
    search: "",
  });

  // Fetch Stock Ledger Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = new URLSearchParams(filters).toString();
        const res = await fetch(`/api/stock-ledger?${query}`);
        if (res.ok) {
          setTransactions(await res.json());
        }
      } catch (err) {
        console.error("Error loading stock ledger", err);
      }
    };
    fetchData();
  }, [filters]);

  // Handle filter change
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle filter submit
  const handleFilter = (e) => {
    e.preventDefault();
    setFilters({ ...filters });
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ transaction_type: "", search: "" });
  };

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-journal-text text-primary"></i> Stock Ledger
          </h1>
          <Link href="/stock-adjustment" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Stock Adjustment
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
          {flash.type === "danger" && <i className="bi bi-exclamation-triangle me-2"></i>}
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
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form className="row g-3" onSubmit={handleFilter}>
                <div className="col-md-3">
                  <label className="form-label">Transaction Type</label>
                  <select
                    name="transaction_type"
                    value={filters.transaction_type}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="sale">Sale</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Search items..."
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button type="submit" className="btn btn-outline-primary d-block">
                    <i className="bi bi-funnel"></i> Filter
                  </button>
                </div>

                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn btn-outline-secondary d-block"
                  >
                    <i className="bi bi-x-circle"></i> Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Ledger Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {transactions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-journal-text fs-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No transactions found</h4>
                  <p className="text-muted">Stock transactions will appear here</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Item</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>In Qty</th>
                        <th>Out Qty</th>
                        <th>Reference</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, idx) => (
                        <tr key={idx}>
                          <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                          <td>
                            <strong>{t.item_code}</strong>
                            <br />
                            <small className="text-muted">{t.item_name}</small>
                          </td>
                          <td>
                            {t.location_name}
                            <br />
                            <small className="text-muted">{t.warehouse_name}</small>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                t.transaction_type === "purchase"
                                  ? "success"
                                  : t.transaction_type === "sale"
                                  ? "danger"
                                  : "warning"
                              }`}
                            >
                              {t.transaction_type.charAt(0).toUpperCase() +
                                t.transaction_type.slice(1)}
                            </span>
                          </td>
                          <td>
                            {t.in_qty > 0 ? Number(t.in_qty).toFixed(2) : "-"}
                          </td>
                          <td>
                            {t.out_qty > 0 ? Number(t.out_qty).toFixed(2) : "-"}
                          </td>
                          <td>
                            {t.reference_type}{" "}
                            {t.reference_id && `#${t.reference_id}`}
                          </td>
                          <td>{t.remarks}</td>
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
