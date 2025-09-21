"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateGRNPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grnItems, setGrnItems] = useState([]);

  const [form, setForm] = useState({
    supplier_id: "",
    purchase_order_id: "",
    grn_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    remarks: "",
    status: "draft",
  });

  // Fetch suppliers + purchase orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, poRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/purchase-orders"),
        ]);
        if (supRes.ok) setSuppliers(await supRes.json());
        if (poRes.ok) setPurchaseOrders(await poRes.json());
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  // Load items from PO
  const handlePOChange = async (po_id) => {
    setForm({ ...form, purchase_order_id: po_id });
    if (!po_id) return setGrnItems([]);

    try {
      const res = await fetch(`/api/purchase-orders/${po_id}`);
      if (res.ok) {
        const po = await res.json();

        // ✅ Auto-set supplier from PO
        setForm((prev) => ({ ...prev, supplier_id: po.supplier_id }));

        // ✅ Load items with ordered qty
        setGrnItems(
          po.items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            item_code: item.item_code,
            uom: item.uom,
            ordered_qty: item.ordered_qty,
            received_qty: item.ordered_qty, // default full receive
            remarks: "",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading PO items:", err);
    }
  };

  const handleItemChange = (i, field, value) => {
    const updated = [...grnItems];
    updated[i][field] = value;
    setGrnItems(updated);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.purchase_order_id) {
      return setFlash({ type: "danger", message: "Select Purchase Order first." });
    }

    try {
      const res = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: grnItems }),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "✅ GRN created successfully!" });
        setForm({
          supplier_id: "",
          purchase_order_id: "",
          grn_date: new Date().toISOString().split("T")[0],
          invoice_number: "",
          remarks: "",
          status: "draft",
        });
        setGrnItems([]);
      } else {
        setFlash({ type: "danger", message: "❌ Failed to create GRN." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error while creating GRN." });
    }
  };

  // ✅ Auto Totals
  const totalItems = grnItems.length;
  const totalOrdered = grnItems.reduce((sum, row) => sum + Number(row.ordered_qty || 0), 0);
  const totalReceived = grnItems.reduce((sum, row) => sum + Number(row.received_qty || 0), 0);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-box-arrow-in-down text-primary"></i> Create GRN
        </h1>
        <Link href="/grn" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back to List
        </Link>
      </div>

      {/* Flash */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
          {flash.type === "danger" && <i className="bi bi-exclamation-triangle me-2"></i>}
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Side - Header */}
          <div className="col-md-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-light fw-bold">GRN Details</div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Supplier */}
                  <div className="col-md-6">
                    <label className="form-label">Supplier *</label>
                    <select
                      id="supplier_id"
                      className="form-select"
                      value={form.supplier_id}
                      onChange={handleChange}
                      required
                      disabled // auto-filled
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplier_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purchase Order */}
                  <div className="col-md-6">
                    <label className="form-label">Purchase Order *</label>
                    <select
                      id="purchase_order_id"
                      className="form-select"
                      value={form.purchase_order_id}
                      onChange={(e) => handlePOChange(e.target.value)}
                      required
                    >
                      <option value="">Select Purchase Order</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.po_number} ({po.supplier_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* GRN Date */}
                  <div className="col-md-6">
                    <label className="form-label">GRN Date *</label>
                    <input
                      type="date"
                      id="grn_date"
                      className="form-control"
                      value={form.grn_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Invoice Number */}
                  <div className="col-md-6">
                    <label className="form-label">Invoice Number</label>
                    <input
                      type="text"
                      id="invoice_number"
                      className="form-control"
                      value={form.invoice_number}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea
                      id="remarks"
                      className="form-control"
                      rows="2"
                      value={form.remarks}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light fw-bold">Summary</div>
              <div className="card-body">
                <p><strong>Total Items:</strong> {totalItems}</p>
                <p><strong>Ordered Qty:</strong> {totalOrdered}</p>
                <p><strong>Received Qty:</strong> {totalReceived}</p>
                <hr />
                <label className="form-label">Status</label>
                <select
                  id="status"
                  className="form-select mb-3"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                </select>
                <button type="submit" className="btn btn-primary w-100 mb-2">
                  <i className="bi bi-check-circle me-2"></i> Save GRN
                </button>
                <Link href="/grn" className="btn btn-outline-secondary w-100">
                  <i className="bi bi-x-circle me-2"></i> Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-light fw-bold">Received Items</div>
          <div className="card-body">
            {!grnItems.length ? (
              <p className="text-muted">Select a Purchase Order to load items.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>UOM</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnItems.map((row, i) => (
                      <tr key={i}>
                        <td>{row.item_name} ({row.item_code})</td>
                        <td>{row.ordered_qty}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={row.ordered_qty}
                            className="form-control border-primary"
                            value={row.received_qty}
                            onChange={(e) => handleItemChange(i, "received_qty", e.target.value)}
                            required
                          />
                        </td>
                        <td>{row.uom}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.remarks}
                            onChange={(e) => handleItemChange(i, "remarks", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
