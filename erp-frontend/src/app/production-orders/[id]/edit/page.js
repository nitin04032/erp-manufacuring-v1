"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProductionOrder() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    status: "draft",
    remarks: "",
    order_qty: "",
    planned_start_date: "",
    planned_end_date: "",
    warehouse_id: "",
  });
  const [warehouses, setWarehouses] = useState([]);

  // Fetch order + warehouses
  useEffect(() => {
    if (id) {
      fetch(`/api/production-orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data);
          setForm({
            status: data.status,
            remarks: data.remarks || "",
            order_qty: data.order_qty,
            planned_start_date: data.planned_start_date
              ? data.planned_start_date.split("T")[0]
              : "",
            planned_end_date: data.planned_end_date
              ? data.planned_end_date.split("T")[0]
              : "",
            warehouse_id: data.warehouse_id || "",
          });
        });

      fetch("/api/warehouses")
        .then((res) => res.json())
        .then((data) => setWarehouses(data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/production-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("✅ Order updated");
      router.push("/production-orders");
    } else {
      const err = await res.json();
      alert("❌ " + (err.error || "Failed to update order"));
    }
  };

  if (!order) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-pencil"></i> Edit Production Order
        </h1>
        <Link href="/production-orders" className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
        <div className="row">
          {/* Status */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Order Qty */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Order Quantity</label>
            <input
              type="number"
              name="order_qty"
              className="form-control"
              value={form.order_qty}
              onChange={handleChange}
              min="1"
              step="0.01"
            />
          </div>

          {/* Planned Dates */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Planned Start Date</label>
            <input
              type="date"
              name="planned_start_date"
              className="form-control"
              value={form.planned_start_date}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Planned End Date</label>
            <input
              type="date"
              name="planned_end_date"
              className="form-control"
              value={form.planned_end_date}
              onChange={handleChange}
            />
          </div>

          {/* Warehouse */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Warehouse</label>
            <select
              name="warehouse_id"
              className="form-select"
              value={form.warehouse_id}
              onChange={handleChange}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.warehouse_name}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div className="col-12 mb-3">
            <label className="form-label">Remarks</label>
            <textarea
              name="remarks"
              className="form-control"
              value={form.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          <i className="bi bi-check-circle me-2"></i> Save Changes
        </button>
      </form>
    </div>
  );
}
