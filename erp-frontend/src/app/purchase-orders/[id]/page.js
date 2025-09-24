"use client";
import { useState, useEffect } from "react";
import React from "react"; // ✅ Needed for <React.Fragment>
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch PO details
  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await fetch(`/api/purchase-orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPurchaseOrder(data);
        } else {
          setFlash({ type: "danger", message: "Purchase Order not found" });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error loading purchase order" });
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id]);

  // ✅ Update Status
  const updateStatus = async (status) => {
    if (!confirm(`Are you sure you want to mark this order as '${status}'?`)) return;

    try {
      const res = await fetch(`/api/purchase-orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Status updated successfully" });
        setPurchaseOrder((prev) => ({ ...prev, status }));
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.error || "Failed to update status" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error" });
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!purchaseOrder) return <div className="p-4">Purchase order not found.</div>;

  // ✅ Status Badge Colors
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
            <i className="bi bi-receipt text-primary"></i> Purchase Order #{purchaseOrder.id}
          </h1>
          <div>
            <Link href="/purchase-orders" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-2"></i>Back to List
            </Link>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-primary dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-gear me-2"></i>Actions
              </button>
              <ul className="dropdown-menu">
                {purchaseOrder.status === "draft" && (
                  <li>
                    <button className="dropdown-item" onClick={() => updateStatus("sent")}>
                      <i className="bi bi-send me-2"></i>Send to Supplier
                    </button>
                  </li>
                )}
                {["sent", "acknowledged"].includes(purchaseOrder.status) && (
                  <li>
                    <button className="dropdown-item" onClick={() => updateStatus("acknowledged")}>
                      <i className="bi bi-check-circle me-2"></i>Mark Acknowledged
                    </button>
                  </li>
                )}
                {purchaseOrder.status !== "cancelled" && (
                  <>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => updateStatus("cancelled")}
                      >
                        <i className="bi bi-x-circle me-2"></i>Cancel Order
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
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

      {/* PO Details */}
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Purchase Order Details</h5>
              <span className={`badge bg-${statusClass[purchaseOrder.status] || "secondary"} fs-6`}>
                {purchaseOrder.status}
              </span>
            </div>
            <div className="card-body">
              <p><strong>Supplier:</strong> {purchaseOrder.supplier_name}</p>
              <p><strong>Warehouse:</strong> {purchaseOrder.warehouse_name}</p>
              <p><strong>PO Date:</strong> {purchaseOrder.po_date}</p>
              {purchaseOrder.expected_delivery_date && (
                <p><strong>Expected Delivery:</strong> {purchaseOrder.expected_delivery_date}</p>
              )}
              {purchaseOrder.terms_and_conditions && (
                <>
                  <hr />
                  <p><strong>Terms & Conditions:</strong> {purchaseOrder.terms_and_conditions}</p>
                </>
              )}
              {purchaseOrder.remarks && (
                <>
                  <hr />
                  <p><strong>Remarks:</strong> {purchaseOrder.remarks}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header"><h5 className="mb-0">Order Summary</h5></div>
            <div className="card-body">
              <p><strong>Subtotal:</strong> ₹ {Number(purchaseOrder.subtotal || 0).toFixed(2)}</p>
              <p><strong>Discount:</strong> ₹ {Number(purchaseOrder.discount_amount || 0).toFixed(2)}</p>
              <p><strong>Tax:</strong> ₹ {Number(purchaseOrder.tax_amount || 0).toFixed(2)}</p>
              <hr />
              <h5>Total: ₹ {Number(purchaseOrder.total_amount || 0).toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul"></i> Purchase Order Items{" "}
                <span className="badge bg-primary ms-2">
                  {purchaseOrder.items?.length || 0}
                </span>
              </h5>
            </div>
            <div className="card-body">
              {!purchaseOrder.items?.length ? (
                <p className="text-muted">No items in this purchase order.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Ordered Qty</th>
                        <th>Received Qty</th>
                        <th>Pending Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Tax</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrder.items.map((item, i) => {
                        const qty = Number(item.ordered_qty) || 0;
                        const price = Number(item.unit_price) || 0;
                        const discountPercent = Number(item.discount_percent) || 0;
                        const taxPercent = Number(item.tax_percent) || 0;

                        const lineAmount = qty * price;
                        const discountAmount = (lineAmount * discountPercent) / 100;
                        const taxableAmount = lineAmount - discountAmount;
                        const taxAmount = (taxableAmount * taxPercent) / 100;
                        const lineTotal = taxableAmount + taxAmount;
                        const pendingQty = qty - (item.received_qty || 0);

                        return (
                          <React.Fragment key={item.id || i}>
                            <tr>
                              <td>
                                <strong>{item.item_name}</strong><br />
                                <small className="text-muted">{item.item_code}</small>
                              </td>
                              <td>{qty} {item.uom}</td>
                              <td>{item.received_qty || 0} {item.uom}</td>
                              <td>{pendingQty > 0 ? pendingQty : 0} {item.uom}</td>
                              <td>₹ {price.toFixed(2)}</td>
                              <td>
                                {discountPercent > 0
                                  ? `₹ ${discountAmount.toFixed(2)} (${discountPercent}%)`
                                  : "-"}
                              </td>
                              <td>
                                {taxPercent > 0
                                  ? `₹ ${taxAmount.toFixed(2)} (${taxPercent}%)`
                                  : "-"}
                              </td>
                              <td><strong>₹ {lineTotal.toFixed(2)}</strong></td>
                            </tr>
                            {item.remarks && (
                              <tr className="table-light">
                                <td colSpan="8" className="small text-muted">
                                  <em>Remarks: {item.remarks}</em>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
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
