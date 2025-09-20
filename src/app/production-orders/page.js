"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductionOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [status, search]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `/api/production-orders?status=${status}&search=${search}`
      );
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-gear text-primary"></i> Production Orders
          </h1>
          <Link href="/production-orders/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create Production Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
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
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search orders..."
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
                  fetchOrders();
                }}
              >
                <i className="bi bi-x-circle"></i> Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-gear fs-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No production orders found</h4>
              <p className="text-muted">
                Start by creating your first production order
              </p>
              <Link href="/production-orders/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Create Production Order
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order No</th>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Planned Qty</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.production_order_no}</strong>
                      </td>
                      <td>
                        <strong>{order.item_code}</strong>
                        <br />
                        <small className="text-muted">{order.item_name}</small>
                      </td>
                      <td>{order.warehouse_name}</td>
                      <td>{order.planned_qty.toFixed(2)}</td>
                      <td>
                        {new Date(order.planned_start_date).toLocaleDateString()}
                      </td>
                      <td>
                        {order.planned_end_date
                          ? new Date(order.planned_end_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            order.status === "draft"
                              ? "secondary"
                              : order.status === "planned"
                              ? "info"
                              : order.status === "in_progress"
                              ? "warning"
                              : "success"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/production-orders/${order.id}`}
                            className="btn btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link
                            href={`/production-orders/${order.id}/edit`}
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
  );
}
