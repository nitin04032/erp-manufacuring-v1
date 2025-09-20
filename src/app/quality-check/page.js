"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function QualityCheckPage() {
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [qualityChecks, setQualityChecks] = useState([]);
  const [items, setItems] = useState([]);

  // Form state
  const [form, setForm] = useState({
    qc_number: `QC${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`,
    qc_date: new Date().toISOString().split("T")[0],
    item_id: "",
    batch_number: "",
    checked_qty: "",
    inspector: "",
    parameters: [],
    result: "",
    remarks: "",
  });

  // Fetch QC list + items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qcRes, itemsRes] = await Promise.all([
          fetch("/api/quality-checks"),
          fetch("/api/items"),
        ]);
        if (qcRes.ok) setQualityChecks(await qcRes.json());
        if (itemsRes.ok) setItems(await itemsRes.json());
      } catch (err) {
        console.error("Error loading QC data", err);
      }
    };
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      let updated = [...form.parameters];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter((p) => p !== value);
      }
      setForm({ ...form, parameters: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/quality-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Quality Check created successfully!" });
        const newQC = await res.json();
        setQualityChecks([...qualityChecks, newQC]);
        // Reset form
        setForm({
          qc_number: `QC${new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}${Math.floor(Math.random() * 9000 + 1000)}`,
          qc_date: new Date().toISOString().split("T")[0],
          item_id: "",
          batch_number: "",
          checked_qty: "",
          inspector: "",
          parameters: [],
          result: "",
          remarks: "",
        });
      } else {
        setFlash({ type: "danger", message: "Failed to create QC." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Error while saving QC." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-clipboard-check text-primary"></i> Quality Control
          </h1>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#createQCModal"
          >
            <i className="bi bi-plus-circle me-2"></i> New Quality Check
          </button>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
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

      {/* QC List */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {qualityChecks.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-check fs-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">No Quality Checks Performed Yet</h5>
                  <p className="text-muted">
                    Create your first quality check to ensure product standards
                  </p>
                  <button
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#createQCModal"
                  >
                    <i className="bi bi-plus-circle me-2"></i>Create First Quality Check
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>QC No</th>
                        <th>Item</th>
                        <th>Batch/Lot</th>
                        <th>Check Date</th>
                        <th>Checked Qty</th>
                        <th>Result</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityChecks.map((qc) => (
                        <tr key={qc.id}>
                          <td>
                            <strong>{qc.qc_number}</strong>
                          </td>
                          <td>{qc.item_name}</td>
                          <td>{qc.batch_number}</td>
                          <td>{new Date(qc.qc_date).toLocaleDateString()}</td>
                          <td>{qc.checked_qty}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                qc.result === "passed"
                                  ? "success"
                                  : qc.result === "failed"
                                  ? "danger"
                                  : "warning"
                              }`}
                            >
                              {qc.result.charAt(0).toUpperCase() + qc.result.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/quality-check/${qc.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/quality-check/${qc.id}/edit`}
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
      </div>

      {/* Create QC Modal */}
      <div className="modal fade" id="createQCModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Create Quality Check</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* QC Number */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">QC Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="qc_number"
                      value={form.qc_number}
                      readOnly
                    />
                  </div>

                  {/* Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="qc_date"
                      value={form.qc_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Item */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item to Check</label>
                    <select
                      name="item_id"
                      className="form-select"
                      value={form.item_id}
                      onChange={handleChange}
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

                  {/* Batch */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Batch/Lot Number</label>
                    <input
                      type="text"
                      name="batch_number"
                      className="form-control"
                      value={form.batch_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity Checked</label>
                    <input
                      type="number"
                      name="checked_qty"
                      className="form-control"
                      min="1"
                      step="0.01"
                      value={form.checked_qty}
                      onChange={handleChange}
                      required
                    />
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
                      required
                    />
                  </div>

                  {/* Parameters */}
                  <div className="col-12 mb-3">
                    <label className="form-label">Quality Parameters</label>
                    <div className="border rounded p-3">
                      {[
                        { id: "visual", label: "Visual Inspection - Passed" },
                        { id: "dimension", label: "Dimensional Check - Passed" },
                        { id: "functional", label: "Functional Test - Passed" },
                      ].map((p) => (
                        <div className="form-check" key={p.id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="parameters"
                            value={p.id}
                            id={p.id}
                            checked={form.parameters.includes(p.id)}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={p.id}>
                            {p.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Overall Result</label>
                    <select
                      name="result"
                      className="form-select"
                      value={form.result}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Result</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="conditional">Conditional Accept</option>
                    </select>
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
                      placeholder="Quality check observations and notes..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                  Create Quality Check
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
