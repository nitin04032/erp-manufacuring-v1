"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PurchaseOrdersPage() {
  // Flash Messages
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Filters
  const [status, setStatus] = useState("");
  const [supplier, setSupplier] = useState("");

  // Data
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Fetch Purchase Orders + Suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, supRes] = await Promise.all([
          fetch("/api/purchase-orders"),
          fetch("/api/suppliers"),
        ]);

        if (poRes.ok) {
          setPurchaseOrders(await poRes.json());
        }
        if (supRes.ok) {
          setSuppliers(await supRes.json());
        }
      } catch (error) {
        setFlash({ type: "danger", message: "Failed to load data." });
      }
    };
    fetchData();
  }, []);

  // Apply filters
  const filteredOrders = purchaseOrders.filter((po) => {
    return (
      (status ? po.status === status : true) &&
      (supplier ? po.supplier_id == supplier : true)
    );
  });

  // Status colors
  const statusClass = {
    draft: "secondary",
    sent: "info",
    acknowledged: "primary",
    partial: "warning",
    completed: "success",
    cancelled: "danger",
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-cart text-primary"></i> Purchase Orders
          </h1>
          <Link href="/purchase-orders/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Create Purchase Order
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
                {/* Status */}
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
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="partial">Partially Received</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Supplier */}
                <div className="col-md-4">
                  <label htmlFor="supplier" className="form-label">
                    Supplier
                  </label>
                  <select
                    id="supplier"
                    className="form-select"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  >
                    <option value="">All Suppliers</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset */}
                <div className="col-md-3 d-flex align-items-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-funnel me-2"></i> Filter
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setStatus("");
                      setSupplier("");
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul"></i> Purchase Orders List{" "}
                <span className="badge bg-primary ms-2">
                  {filteredOrders.length}
                </span>
              </h5>
            </div>
            <div className="card-body">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x display-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No Purchase Orders Found</h4>
                  <p className="text-muted">
                    Create your first purchase order to get started.
                  </p>
                  <Link href="/purchase-orders/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Create Purchase Order
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Warehouse</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((po) => (
                        <tr key={po.id}>
                          <td>
                            <strong>{po.po_number}</strong>
                          </td>
                          <td>
                            {new Date(po.po_date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td>{po.supplier_name}</td>
                          <td>{po.warehouse_name}</td>
                          <td>₹ {Number(po.total_amount).toFixed(2)}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                statusClass[po.status] || "secondary"
                              }`}
                            >
                              {po.status.charAt(0).toUpperCase() +
                                po.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <Link
                                href={`/purchase-orders/${po.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              {po.status === "draft" && (
                                <Link
                                  href={`/purchase-orders/${po.id}/edit`}
                                  className="btn btn-sm btn-outline-secondary"
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              )}
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
