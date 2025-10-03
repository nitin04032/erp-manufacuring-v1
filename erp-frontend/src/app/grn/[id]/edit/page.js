"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditGRNPage() {
  const { id } = useParams();
  const router = useRouter();

  const [grn, setGrn] = useState(null);
  const [grnItems, setGrnItems] = useState([]);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Load GRN details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/grn/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGrn(data);
          setGrnItems(data.items || []);
        }
      } catch (err) {
        console.error("❌ Failed to load GRN:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (field, value) => {
    setGrn((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (i, field, value) => {
    const updated = [...grnItems];
    updated[i][field] = value;
    setGrnItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/grn/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...grn, items: grnItems }),
      });

      if (res.ok) {
        setFlash({ type: "success", message: "✅ GRN updated successfully!" });
        router.push(`/grn/${id}`);
      } else {
        setFlash({ type: "danger", message: "❌ Failed to update GRN." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error while updating GRN." });
    }
  };

  if (!grn) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-pencil text-warning"></i> Edit GRN
        </h1>
        <Link href={`/grn/${id}`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back to Details
        </Link>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
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
          {/* Left - Header */}
          <div className="col-md-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header fw-bold">GRN Header</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">GRN No</label>
                    <input
                      type="text"
                      className="form-control"
                      value={grn.receipt_number || ""}
                      onChange={(e) => handleChange("receipt_number", e.target.value)}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">GRN Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={grn.receipt_date?.split("T")[0] || ""}
                      onChange={(e) => handleChange("receipt_date", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={grn.remarks || ""}
                      onChange={(e) => handleChange("remarks", e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header fw-bold">Actions</div>
              <div className="card-body">
                <label className="form-label">Status</label>
                <select
                  className="form-select mb-3"
                  value={grn.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                </select>
                <button type="submit" className="btn btn-warning w-100 mb-2">
                  <i className="bi bi-check-circle me-2"></i> Update GRN
                </button>
                <Link href={`/grn/${id}`} className="btn btn-outline-secondary w-100">
                  <i className="bi bi-x-circle me-2"></i> Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card shadow-sm mt-4">
          <div className="card-header fw-bold">Received Items</div>
          <div className="card-body table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Ordered Qty</th>
                  <th>Received Qty</th>
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
                        className="form-control"
                        value={row.received_qty}
                        onChange={(e) => handleItemChange(i, "received_qty", e.target.value)}
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
        </div>
      </form>
    </div>
  );
}
