"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreatePurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

  const [poData, setPoData] = useState({
    supplier_id: "",
    warehouse_id: "",
    po_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    terms_and_conditions: "",
    remarks: "",
    status: "draft",
    items: [],
  });

  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, whRes, itemRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/warehouses"),
          fetch("/api/items"),
        ]);
        if (supRes.ok) setSuppliers(await supRes.json());
        if (whRes.ok) setWarehouses(await whRes.json());
        if (itemRes.ok) setItems(await itemRes.json());
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  // Add Item Row
  const addItemRow = () => {
    setPoData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: "",
          ordered_qty: 0,
          unit_price: 0,
          discount_percent: 0,
          tax_percent: 0,
          remarks: "",
        },
      ],
    }));
  };

  // Remove Item Row
  const removeItemRow = (index) => {
    const newItems = [...poData.items];
    newItems.splice(index, 1);
    setPoData({ ...poData, items: newItems });
  };

  // Update Item Row
  const updateItemRow = (index, field, value) => {
    const newItems = [...poData.items];
    newItems[index][field] = value;

    // Auto set unit price if item is selected
    if (field === "item_id") {
      const item = items.find((i) => i.id == value);
      if (item) {
        newItems[index].unit_price = item.purchase_rate;
      }
    }

    setPoData({ ...poData, items: newItems });
  };

  // Calculate totals whenever items change
  useEffect(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    poData.items.forEach((row) => {
      const qty = parseFloat(row.ordered_qty) || 0;
      const price = parseFloat(row.unit_price) || 0;
      const discountPercent = parseFloat(row.discount_percent) || 0;
      const taxPercent = parseFloat(row.tax_percent) || 0;

      const lineAmount = qty * price;
      const discountAmount = (lineAmount * discountPercent) / 100;
      const taxableAmount = lineAmount - discountAmount;
      const taxAmount = (taxableAmount * taxPercent) / 100;

      subtotal += lineAmount;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    });

    setSummary({
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: subtotal - totalDiscount + totalTax,
    });
  }, [poData.items]);

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (poData.items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    console.log("Submit Data:", poData);
    // TODO: call API POST /api/purchase-orders
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-plus-circle text-primary"></i> Create Purchase Order
          </h1>
          <Link href="/purchase-orders" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Section */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Purchase Order Details</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Supplier */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Supplier *</label>
                    <select
                      className="form-select"
                      required
                      value={poData.supplier_id}
                      onChange={(e) =>
                        setPoData({ ...poData, supplier_id: e.target.value })
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
                    <label className="form-label">Warehouse *</label>
                    <select
                      className="form-select"
                      required
                      value={poData.warehouse_id}
                      onChange={(e) =>
                        setPoData({ ...poData, warehouse_id: e.target.value })
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
                    <label className="form-label">PO Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={poData.po_date}
                      onChange={(e) =>
                        setPoData({ ...poData, po_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expected Delivery Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={poData.expected_delivery_date}
                      onChange={(e) =>
                        setPoData({
                          ...poData,
                          expected_delivery_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* T&C */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Terms & Conditions</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={poData.terms_and_conditions}
                      onChange={(e) =>
                        setPoData({
                          ...poData,
                          terms_and_conditions: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Remarks */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={poData.remarks}
                      onChange={(e) =>
                        setPoData({ ...poData, remarks: e.target.value })
                      }
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
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                {/* Status */}
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={poData.status}
                    onChange={(e) =>
                      setPoData({ ...poData, status: e.target.value })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>

                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹ {summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount:</span>
                  <span>₹ {summary.discount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>₹ {summary.tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>₹ {summary.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Purchase Order Items</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={addItemRow}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Item
                </button>
              </div>
              <div className="card-body">
                {poData.items.length === 0 ? (
                  <p className="text-muted">No items added yet.</p>
                ) : (
                  poData.items.map((row, index) => {
                    const item = items.find((i) => i.id == row.item_id);
                    return (
                      <div
                        key={index}
                        className="item-row border rounded p-3 mb-3 bg-light"
                      >
                        <div className="row">
                          <div className="col-md-3 mb-2">
                            <label className="form-label">Item *</label>
                            <select
                              className="form-select"
                              value={row.item_id}
                              onChange={(e) =>
                                updateItemRow(index, "item_id", e.target.value)
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
                          <div className="col-md-2 mb-2">
                            <label className="form-label">Qty *</label>
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.001"
                              value={row.ordered_qty}
                              onChange={(e) =>
                                updateItemRow(
                                  index,
                                  "ordered_qty",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <label className="form-label">Unit Price *</label>
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              step="0.01"
                              value={row.unit_price}
                              onChange={(e) =>
                                updateItemRow(
                                  index,
                                  "unit_price",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="col-md-1 mb-2">
                            <label className="form-label">Disc %</label>
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              step="0.01"
                              value={row.discount_percent}
                              onChange={(e) =>
                                updateItemRow(
                                  index,
                                  "discount_percent",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-1 mb-2">
                            <label className="form-label">Tax %</label>
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              step="0.01"
                              value={row.tax_percent}
                              onChange={(e) =>
                                updateItemRow(
                                  index,
                                  "tax_percent",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <label className="form-label">Line Total</label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={
                                "₹ " +
                                (
                                  (row.ordered_qty * row.unit_price -
                                    (row.ordered_qty *
                                      row.unit_price *
                                      row.discount_percent) /
                                      100) +
                                  ((row.ordered_qty * row.unit_price -
                                    (row.ordered_qty *
                                      row.unit_price *
                                      row.discount_percent) /
                                      100) *
                                    row.tax_percent) /
                                    100
                                ).toFixed(2)
                              }
                            />
                          </div>
                          <div className="col-md-1 mb-2">
                            <label className="form-label">&nbsp;</label>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm w-100"
                              onClick={() => removeItemRow(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="col-12">
                            <textarea
                              className="form-control"
                              rows="1"
                              placeholder="Item remarks (optional)"
                              value={row.remarks}
                              onChange={(e) =>
                                updateItemRow(index, "remarks", e.target.value)
                              }
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="row mt-4">
          <div className="col-12 text-end">
            <Link href="/purchase-orders" className="btn btn-secondary me-2">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-circle me-2"></i>Create Purchase Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
