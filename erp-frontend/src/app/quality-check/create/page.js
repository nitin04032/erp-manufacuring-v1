  "use client";
  import { useState, useEffect } from "react";
  import Link from "next/link";

  export default function CreateQualityCheck() {
    const [flash, setFlash] = useState({ type: "", message: "" });
    const [items, setItems] = useState([]);

    // Main QC form state
    const [form, setForm] = useState({
      qc_number: `QC${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`,
      qc_date: new Date().toISOString().split("T")[0],
      reference_type: "",
      inspector: "",
      remarks: "",
      status: "pending",
    });

    // Items state (dynamic rows)
    const [qcItems, setQcItems] = useState([]);

    // Fetch items from API
    useEffect(() => {
      const fetchItems = async () => {
        try {
          const res = await fetch("/api/items");
          if (res.ok) {
            setItems(await res.json());
          }
        } catch (err) {
          console.error("Error loading items", err);
        }
      };
      fetchItems();
    }, []);

    // Handle main form changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };

    // Add new QC item row
    const addItemRow = () => {
      setQcItems([
        ...qcItems,
        { item_id: "", qty: "", result: "pending", remarks: "" },
      ]);
    };

    // Remove QC item row
    const removeItemRow = (index) => {
      setQcItems(qcItems.filter((_, i) => i !== index));
    };

    // Handle QC item change
    const handleItemChange = (index, field, value) => {
      const updated = [...qcItems];
      updated[index][field] = value;
      setQcItems(updated);
    };

    // Submit form
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (qcItems.length === 0) {
        setFlash({ type: "danger", message: "Please add at least one QC item." });
        return;
      }

      try {
        const res = await fetch("/api/quality-checks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, items: qcItems }),
        });

        if (res.ok) {
          setFlash({ type: "success", message: "Quality Check created successfully!" });
          setForm({
            qc_number: `QC${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`,
            qc_date: new Date().toISOString().split("T")[0],
            reference_type: "",
            inspector: "",
            remarks: "",
            status: "pending",
          });
          setQcItems([]);
        } else {
          setFlash({ type: "danger", message: "Failed to create Quality Check." });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error saving Quality Check." });
      }
    };

    return (
      <div className="container-fluid">
        {/* Page Header */}
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">
              <i className="bi bi-clipboard-check text-primary"></i> Create Quality Check
            </h1>
            <Link href="/quality-check" className="btn btn-outline-secondary">
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {/* QC Header */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Quality Check Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* QC Number */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">QC Number</label>
                      <input
                        type="text"
                        name="qc_number"
                        className="form-control"
                        value={form.qc_number}
                        readOnly
                      />
                    </div>

                    {/* QC Date */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">QC Date</label>
                      <input
                        type="date"
                        name="qc_date"
                        className="form-control"
                        value={form.qc_date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Reference */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Reference Document</label>
                      <select
                        name="reference_type"
                        className="form-select"
                        value={form.reference_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Reference</option>
                        <option value="grn">Goods Receipt Note</option>
                        <option value="production">Production Order</option>
                        <option value="dispatch">Dispatch</option>
                      </select>
                    </div>

                    {/* Inspector */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Inspector</label>
                      <input
                        type="text"
                        name="inspector"
                        className="form-control"
                        value={form.inspector}
                        onChange={handleChange}
                        placeholder="Inspector name"
                        required
                      />
                    </div>

                    {/* Remarks */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        name="remarks"
                        className="form-control"
                        rows="3"
                        value={form.remarks}
                        onChange={handleChange}
                        placeholder="Notes about this quality check..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QC Status */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Status</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <hr />

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>Create Quality Check
                    </button>
                    <Link href="/quality-check" className="btn btn-outline-secondary">
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QC Items */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Items to Inspect</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={addItemRow}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Item
                  </button>
                </div>
                <div className="card-body">
                  {qcItems.length === 0 && (
                    <p className="text-muted">No items added yet</p>
                  )}
                  {qcItems.map((row, index) => (
                    <div
                      key={index}
                      className="qc-item-row border rounded p-3 mb-3 bg-light"
                    >
                      <div className="row">
                        {/* Item */}
                        <div className="col-md-3 mb-2">
                          <label className="form-label">Item</label>
                          <select
                            className="form-select"
                            value={row.item_id}
                            onChange={(e) =>
                              handleItemChange(index, "item_id", e.target.value)
                            }
                            required
                          >
                            <option value="">Select Item</option>
                            {items.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.item_name} ({item.item_code})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="col-md-2 mb-2">
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            className="form-control"
                            step="0.001"
                            min="0"
                            value={row.qty}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            required
                          />
                        </div>

                        {/* Result */}
                        <div className="col-md-2 mb-2">
                          <label className="form-label">Result</label>
                          <select
                            className="form-select"
                            value={row.result}
                            onChange={(e) =>
                              handleItemChange(index, "result", e.target.value)
                            }
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                          </select>
                        </div>

                        {/* Remarks */}
                        <div className="col-md-3 mb-2">
                          <label className="form-label">Remarks</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Optional"
                            value={row.remarks}
                            onChange={(e) =>
                              handleItemChange(index, "remarks", e.target.value)
                            }
                          />
                        </div>

                        {/* Remove */}
                        <div className="col-md-2 mb-2">
                          <label className="form-label">&nbsp;</label>
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={() => removeItemRow(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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
