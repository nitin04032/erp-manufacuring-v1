"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditPurchaseOrderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, supRes, whRes] = await Promise.all([
          fetch(`/api/purchase-orders/${id}`),
          fetch("/api/suppliers"),
          fetch("/api/warehouses"),
        ]);
        if (poRes.ok) setPurchaseOrder(await poRes.json());
        if (supRes.ok) setSuppliers(await supRes.json());
        if (whRes.ok) setWarehouses(await whRes.json());
      } catch (err) {
        console.error("Failed to load data", err);
        setFlash({ type: "danger", message: "Failed to load purchase order." });
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (field, value) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseOrder),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Purchase order updated!" });
        router.push(`/purchase-orders/${id}`);
      } else {
        setFlash({ type: "danger", message: "Error updating purchase order." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error. Try again later." });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/purchase-orders");
      } else {
        alert("Failed to delete purchase order.");
      }
    } catch (err) {
      alert("Server error while deleting order.");
    }
  };

  if (!purchaseOrder) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-pencil text-warning"></i> Edit Purchase Order
          </h1>
          <div>
            <Link
              href={`/purchase-orders/${purchaseOrder.id}`}
              className="btn btn-outline-info me-2"
            >
              <i className="bi bi-eye me-2"></i>View Details
            </Link>
            <Link href="/purchase-orders" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Back to List
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
        >
          {flash.type === "danger" && (
            <i className="bi bi-exclamation-triangle me-2"></i>
          )}
          {flash.type === "success" && (
            <i className="bi bi-check-circle me-2"></i>
          )}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Section */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Purchase Order Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* PO Number (Read Only) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">PO Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchaseOrder.po_number}
                      readOnly
                    />
                    <div className="form-text">
                      Purchase order number cannot be changed
                    </div>
                  </div>

                  {/* Current Status (Read Only) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Current Status</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchaseOrder.status}
                      readOnly
                    />
                  </div>

                  {/* Supplier */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Supplier <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={purchaseOrder.supplier_id}
                      onChange={(e) =>
                        handleChange("supplier_id", e.target.value)
                      }
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplier_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warehouse */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Delivery Warehouse <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={purchaseOrder.warehouse_id}
                      onChange={(e) =>
                        handleChange("warehouse_id", e.target.value)
                      }
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.warehouse_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Order Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={purchaseOrder.order_date}
                      onChange={(e) =>
                        handleChange("order_date", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expected Delivery Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={purchaseOrder.delivery_date}
                      onChange={(e) =>
                        handleChange("delivery_date", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={purchaseOrder.remarks || ""}
                      onChange={(e) => handleChange("remarks", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-gear me-2"></i>Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-warning">
                  <h6>
                    <i className="bi bi-exclamation-triangle me-2"></i>Important
                    Notes
                  </h6>
                  <ul className="mb-0 small">
                    <li>Verify all supplier and delivery details</li>
                    <li>Ensure dates are realistic</li>
                    <li>Changes will be tracked for audit</li>
                    <li>Status changes require separate action</li>
                  </ul>
                </div>

                <hr />

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-check-circle me-2"></i>Update Purchase
                    Order
                  </button>
                  <Link
                    href={`/purchase-orders/${purchaseOrder.id}`}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-x-circle me-2"></i>Cancel Changes
                  </Link>
                </div>

                <hr />

                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
