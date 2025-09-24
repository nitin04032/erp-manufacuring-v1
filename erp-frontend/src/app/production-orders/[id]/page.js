"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductionOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/production-orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="container py-5">Loading...</div>;
  if (!order) return <div className="container py-5">❌ Order not found</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-gear text-primary"></i> Production Order Detail
        </h1>
        <Link href="/production-orders" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Back
        </Link>
      </div>

      {/* Order Info */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <p><strong>Order No:</strong> {order.order_number}</p>
          <p><strong>Product:</strong> {order.fg_name} ({order.fg_code})</p>
          <p><strong>BOM Version:</strong> {order.bom_version}</p>
          <p><strong>Quantity:</strong> {order.order_qty}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Remarks:</strong> {order.remarks || "-"}</p>
        </div>
      </div>

      {/* Components */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">Components</div>
        <div className="card-body">
          {order.components?.length > 0 ? (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Planned Qty</th>
                  <th>Issued Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.components.map((c, i) => (
                  <tr key={c.id || i}>
                    <td>{c.item_code}</td>
                    <td>{c.item_name}</td>
                    <td>{c.planned_qty}</td>
                    <td>{c.issued_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No components</p>
          )}
        </div>
      </div>
    </div>
  );
}
