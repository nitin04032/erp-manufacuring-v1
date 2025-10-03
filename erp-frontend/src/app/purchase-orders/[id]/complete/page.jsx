"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CompleteProductionOrder() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [producedQty, setProducedQty] = useState("");
  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);

  // 🔹 Fetch Order
  useEffect(() => {
    fetch(`/api/production-orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(() => setFlash({ type: "danger", msg: "Failed to load order" }));
  }, [id]);

  // 🔹 Submit Completion
  async function handleComplete(e) {
    e.preventDefault();
    setFlash(null);

    if (!producedQty || isNaN(producedQty) || Number(producedQty) <= 0) {
      setFlash({ type: "danger", msg: "Please enter valid Produced Quantity" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/production-completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          production_order_id: id,
          produced_qty: Number(producedQty),
          warehouse_id: order.warehouse_id,
          remarks: "Completed via UI",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFlash({ type: "success", msg: data.message });
        setTimeout(() => router.push(`/production-orders/${id}`), 1500);
      } else {
        setFlash({ type: "danger", msg: data.error || "Failed to complete order" });
      }
    } catch (err) {
      setFlash({ type: "danger", msg: "Server error" });
    } finally {
      setSaving(false);
    }
  }

  if (!order) return <div className="container py-5">Loading...</div>;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-check-circle text-success"></i> Complete Production Order
        </h1>
        <Link href={`/production-orders/${id}`} className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      {flash && <div className={`alert alert-${flash.type}`}>{flash.msg}</div>}

      {/* Order Info */}
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Order No:</strong> {order.order_number}</p>
          <p><strong>Product:</strong> {order.fg_name} ({order.fg_code})</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      </div>

      {/* Complete Form */}
      <form onSubmit={handleComplete} className="card p-3">
        <div className="mb-3">
          <label className="form-label">Produced Quantity *</label>
          <input
            type="number"
            className="form-control"
            value={producedQty}
            onChange={(e) => setProducedQty(e.target.value)}
            step="0.001"
            min="0.001"
            required
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Completing...
            </>
          ) : (
            <><i className="bi bi-check-circle me-2"></i> Complete Production</>
          )}
        </button>
      </form>
    </div>
  );
}
