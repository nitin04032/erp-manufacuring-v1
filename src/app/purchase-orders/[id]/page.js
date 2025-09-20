"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch PO details
  useEffect(() => {
    const fetchPO = async () => {
      try {
        const res = await fetch(`/api/purchase-orders/${id}`);
        if (res.ok) {
          setPurchaseOrder(await res.json());
        } else {
          setFlash({ type: "danger", message: "Purchase order not found" });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error loading purchase order" });
      }
    };
    fetchPO();
  }, [id]);

  const updateStatus = async (status) => {
    const confirmMsg =
      status === "sent"
        ? "Send to Supplier?"
        : status === "acknowledged"
        ? "Mark as Acknowledged?"
        : status === "cancelled"
        ? "Cancel this order?"
        : "Update status?";

    if (!confirm(confirmMsg)) return;

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
        setFlash({ type: "danger", message: "Failed to update status" });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error" });
    }
  };

  if (!purchaseOrder) return <div className="p-4">Loading...</div>;

  // Status badge color mapping
  const statusClass = {
    draft: "secondary",
    sent: "info",
    acknowledged: "primary",
    partial: "warning",
    completed: "success",
    cancelled: "danger",
  };
  const badgeClass = statusClass[purchaseOrder.status] || "secondary";

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-receipt text-primary"></i> Purchase Order:{" "}
            {purchaseOrder.po_number}
          </h1>
          <div>
            <Link
              href="/purchase-orders"
              className="btn btn-outline-secondary me-2"
            >
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
                    <button
                      className="dropdown-item"
                      onClick={() => updateStatus("sent")}
                    >
                      <i className="bi bi-send me-2"></i>Send to Supplier
                    </button>
                  </li>
                )}
                {["sent", "acknowledged"].includes(purchaseOrder.status) && (
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => updateStatus("acknowledged")}
                    >
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
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
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

      <div className="row">
        {/* PO Header */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Purchase Order Details</h5>
              <span className={`badge bg-${badgeClass} fs-6`}>
                {purchaseOrder.status}
              </span>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Supplier Info */}
                <div className="col-md-6">
                  <h6 className="text-muted">Supplier Information</h6>
                  <p className="mb-1">
                    <strong>{purchaseOrder.supplier_name}</strong>
                  </p>
                  {purchaseOrder.contact_person && (
                    <p className="mb-1">
                      Contact: {purchaseOrder.contact_person}
                    </p>
                  )}
                  {purchaseOrder.email && (
                    <p className="mb-1">Email: {purchaseOrder.email}</p>
                  )}
                  {purchaseOrder.phone && (
                    <p className="mb-1">Phone: {purchaseOrder.phone}</p>
                  )}
                </div>

                {/* Order Info */}
                <div className="col-md-6">
                  <h6 className="text-muted">Order Information</h6>
                  <p className="mb-1">
                    <strong>PO Number:</strong> {purchaseOrder.po_number}
                  </p>
                  <p className="mb-1">
                    <strong>PO Date:</strong> {purchaseOrder.po_date}
                  </p>
                  {purchaseOrder.expected_delivery_date && (
                    <p className="mb-1">
                      <strong>Expected Delivery:</strong>{" "}
                      {purchaseOrder.expected_delivery_date}
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>Warehouse:</strong> {purchaseOrder.warehouse_name}
                  </p>
                </div>
              </div>

              {purchaseOrder.terms_and_conditions && (
                <>
                  <hr />
                  <h6 className="text-muted">Terms & Conditions</h6>
                  <p>{purchaseOrder.terms_and_conditions}</p>
                </>
              )}

              {purchaseOrder.remarks && (
                <>
                  <hr />
                  <h6 className="text-muted">Remarks</h6>
                  <p>{purchaseOrder.remarks}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PO Summary */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹ {purchaseOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Discount:</span>
                <span>₹ {purchaseOrder.discount_amount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>₹ {purchaseOrder.tax_amount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>₹ {purchaseOrder.total_amount.toFixed(2)}</strong>
              </div>
              <hr />
              <div className="small text-muted">
                <p className="mb-1">
                  <strong>Created:</strong> {purchaseOrder.created_at}
                </p>
                <p className="mb-0">
                  <strong>Updated:</strong> {purchaseOrder.updated_at}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PO Items */}
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
                <div className="text-center py-4">
                  <i className="bi bi-box display-4 text-muted"></i>
                  <p className="text-muted mt-3">
                    No items found in this purchase order.
                  </p>
                </div>
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
                      {purchaseOrder.items.map((item, idx) => (
                        <>
                          <tr key={idx}>
                            <td>
                              <div>
                                <strong>{item.item_name}</strong>
                                <br />
                                <small className="text-muted">
                                  {item.item_code}
                                </small>
                              </div>
                            </td>
                            <td>
                              {item.ordered_qty} {item.uom}
                            </td>
                            <td>
                              {item.received_qty > 0 ? (
                                <span className="text-success">
                                  {item.received_qty}
                                </span>
                              ) : (
                                <span className="text-muted">0</span>
                              )}{" "}
                              {item.uom}
                            </td>
                            <td>
                              {item.pending_qty > 0 ? (
                                <span className="text-warning">
                                  {item.pending_qty}
                                </span>
                              ) : (
                                <span className="text-success">0</span>
                              )}{" "}
                              {item.uom}
                            </td>
                            <td>₹ {item.unit_price.toFixed(2)}</td>
                            <td>
                              {item.discount_amount > 0 ? (
                                <>
                                  ₹ {item.discount_amount.toFixed(2)}{" "}
                                  <small className="text-muted">
                                    ({item.discount_percent}%)
                                  </small>
                                </>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {item.tax_amount > 0 ? (
                                <>
                                  ₹ {item.tax_amount.toFixed(2)}{" "}
                                  <small className="text-muted">
                                    ({item.tax_percent}%)
                                  </small>
                                </>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <strong>₹ {item.line_total.toFixed(2)}</strong>
                            </td>
                          </tr>
                          {item.remarks && (
                            <tr>
                              <td colSpan="8" className="small text-muted">
                                <em>Remarks: {item.remarks}</em>
                              </td>
                            </tr>
                          )}
                        </>
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
