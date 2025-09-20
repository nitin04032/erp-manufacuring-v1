"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditPurchaseOrderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, supRes, whRes, itemRes] = await Promise.all([
          fetch(`/api/purchase-orders/${id}`),
          fetch("/api/suppliers"),
          fetch("/api/warehouses"),
          fetch("/api/items"),
        ]);
        if (poRes.ok) setPurchaseOrder(await poRes.json());
        if (supRes.ok) setSuppliers(await supRes.json());
        if (whRes.ok) setWarehouses(await whRes.json());
        if (itemRes.ok) setItems(await itemRes.json());
      } catch (err) {
        console.error("Failed to load data", err);
        setFlash({ type: "danger", message: "Failed to load purchase order." });
      }
    };
    fetchData();
  }, [id]);

  // ✅ Update header field
  const handleChange = (field, value) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Update item row
  const updateItemRow = (index, field, value) => {
    const newItems = [...purchaseOrder.items];
    newItems[index][field] = value;

    if (field === "item_id") {
      const item = items.find((i) => i.id == value);
      if (item) {
        newItems[index].unit_price = item.purchase_rate || 0;
      }
    }

    setPurchaseOrder({ ...purchaseOrder, items: newItems });
  };

  // ✅ Add item row
  const addItemRow = () => {
    setPurchaseOrder((prev) => ({
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

  // ✅ Remove item row
  const removeItemRow = (index) => {
    const newItems = [...purchaseOrder.items];
    newItems.splice(index, 1);
    setPurchaseOrder({ ...purchaseOrder, items: newItems });
  };

  // ✅ Submit
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

  if (!purchaseOrder) return <div className="p-4">Loading...</div>;

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

      {/* Flash */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
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
            {/* PO Info */}
            <div className="card mb-4">
              <div className="card-header">Purchase Order Information</div>
              <div className="card-body">
                <div className="row">
                  {/* Supplier */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Supplier *</label>
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
                    <label className="form-label">Warehouse *</label>
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
                    <label className="form-label">PO Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={purchaseOrder.po_date || ""}
                      onChange={(e) => handleChange("po_date", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expected Delivery *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={purchaseOrder.expected_delivery_date || ""}
                      onChange={(e) =>
                        handleChange("expected_delivery_date", e.target.value)
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

            {/* Items Editable Table */}
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h5 className="mb-0">Items</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={addItemRow}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Item
                </button>
              </div>
              <div className="card-body">
                {!purchaseOrder.items?.length ? (
                  <p className="text-muted">No items yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Disc %</th>
                          <th>Tax %</th>
                          <th>Remarks</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrder.items.map((row, i) => (
                          <tr key={i}>
                            <td>
                              <select
                                className="form-select"
                                value={row.item_id}
                                onChange={(e) =>
                                  updateItemRow(i, "item_id", e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                {items.map((it) => (
                                  <option key={it.id} value={it.id}>
                                    {it.item_name} ({it.item_code})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={row.ordered_qty}
                                onChange={(e) =>
                                  updateItemRow(i, "ordered_qty", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={row.unit_price}
                                onChange={(e) =>
                                  updateItemRow(i, "unit_price", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={row.discount_percent}
                                onChange={(e) =>
                                  updateItemRow(i, "discount_percent", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                value={row.tax_percent}
                                onChange={(e) =>
                                  updateItemRow(i, "tax_percent", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={row.remarks || ""}
                                onChange={(e) =>
                                  updateItemRow(i, "remarks", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <strong>
                                ₹{" "}
                                {(
                                  row.ordered_qty * row.unit_price -
                                  (row.ordered_qty *
                                    row.unit_price *
                                    row.discount_percent) /
                                    100 +
                                  ((row.ordered_qty * row.unit_price -
                                    (row.ordered_qty *
                                      row.unit_price *
                                      row.discount_percent) /
                                      100) *
                                    row.tax_percent) /
                                    100
                                ).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeItemRow(i)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
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

          {/* Right Section */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">Actions</div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-check-circle me-2"></i>Update Order
                  </button>
                  <Link
                    href={`/purchase-orders/${purchaseOrder.id}`}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
