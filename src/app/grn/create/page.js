"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateGRNPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [grnItems, setGrnItems] = useState([
    { item_id: "", ordered_qty: 0, received_qty: "", remarks: "" },
  ]);

  const [form, setForm] = useState({
    supplier_id: "",
    purchase_order_id: "",
    grn_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    remarks: "",
    status: "draft",
  });

  // Fetch suppliers, POs, items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, poRes, itemRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/purchase-orders"),
          fetch("/api/items"),
        ]);
        if (supRes.ok) setSuppliers(await supRes.json());
        if (poRes.ok) setPurchaseOrders(await poRes.json());
        if (itemRes.ok) setItems(await itemRes.json());
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // Handle GRN item row change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...grnItems];
    updatedItems[index][field] = value;
    setGrnItems(updatedItems);
  };

  // Add new GRN item row
  const addItemRow = () => {
    setGrnItems([
      ...grnItems,
      { item_id: "", ordered_qty: 0, received_qty: "", remarks: "" },
    ]);
  };

  // Remove GRN item row
  const removeItemRow = (index) => {
    setGrnItems(grnItems.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (grnItems.length === 0) {
      setFlash({ type: "danger", message: "Please add at least one item." });
      return;
    }

    try {
      const res = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: grnItems }),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "GRN created successfully!" });
        setForm({
          supplier_id: "",
          purchase_order_id: "",
          grn_date: new Date().toISOString().split("T")[0],
          invoice_number: "",
          remarks: "",
          status: "draft",
        });
        setGrnItems([
          { item_id: "", ordered_qty: 0, received_qty: "", remarks: "" },
        ]);
      } else {
        setFlash({ type: "danger", message: "Failed to create GRN." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Error while creating GRN." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-box-arrow-in-down text-primary"></i> Create GRN
          </h1>
          <Link href="/grn" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to List
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* GRN Header */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">GRN Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Supplier */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Supplier *</label>
                    <select
                      id="supplier_id"
                      className="form-select"
                      value={form.supplier_id}
                      onChange={handleChange}
                      required
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
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Purchase Order *</label>
                    <select
                      id="purchase_order_id"
                      className="form-select"
                      value={form.purchase_order_id}
                      onChange={handleChange}
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
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
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
                  <div className="col-12 mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      id="remarks"
                      className="form-control"
                      rows="2"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Any additional remarks"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Summary</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>Create GRN
                  </button>
                  <Link href="/grn" className="btn btn-outline-secondary">
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Received Items</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={addItemRow}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Item
                </button>
              </div>
              <div className="card-body">
                {grnItems.map((row, i) => (
                  <div
                    key={i}
                    className="grn-item-row border rounded p-3 mb-3 bg-light"
                  >
                    <div className="row">
                      {/* Item */}
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Item *</label>
                        <select
                          className="form-select"
                          value={row.item_id}
                          onChange={(e) =>
                            handleItemChange(i, "item_id", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Item</option>
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.item_name} ({it.item_code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ordered Qty */}
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Ordered Qty</label>
                        <input
                          type="number"
                          className="form-control"
                          value={row.ordered_qty}
                          readOnly
                        />
                      </div>

                      {/* Received Qty */}
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Received Qty *</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="form-control"
                          value={row.received_qty}
                          onChange={(e) =>
                            handleItemChange(i, "received_qty", e.target.value)
                          }
                          required
                        />
                      </div>

                      {/* Remove Btn */}
                      <div className="col-md-2 mb-2">
                        <label className="form-label">&nbsp;</label>
                        <button
                          type="button"
                          className="btn btn-danger w-100"
                          onClick={() => removeItemRow(i)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                      {/* Remarks */}
                      <div className="col-12">
                        <textarea
                          className="form-control mt-2"
                          rows="1"
                          placeholder="Item remarks (optional)"
                          value={row.remarks}
                          onChange={(e) =>
                            handleItemChange(i, "remarks", e.target.value)
                          }
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
