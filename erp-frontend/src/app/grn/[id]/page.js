"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GRNDetailsPage() {
  const { id } = useParams();
  const [grn, setGrn] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/grn/${id}`);
        if (res.ok) {
          setGrn(await res.json());
        } else {
          setFlash({ type: "danger", message: "GRN not found." });
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error loading GRN." });
      }
    };
    fetchData();
  }, [id]);

  if (!grn) return <div className="p-4">Loading...</div>;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-box-arrow-in-down text-primary"></i> GRN #
          {grn.id}
        </h1>
        <div>
          <Link href="/grn" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-2"></i> Back to List
          </Link>
          <Link
            href={`/grn/${grn.id}/edit`}
            className="btn btn-outline-warning"
          >
            <i className="bi bi-pencil me-2"></i> Edit
          </Link>
        </div>
      </div>

      {/* Flash */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
        >
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* GRN Header */}
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header fw-bold">GRN Details</div>
            <div className="card-body">
              <p>
                <strong>Receipt Number:</strong> {grn.receipt_number}
              </p>
              <p>
                <strong>Purchase Order:</strong> {grn.po_number}
              </p>
              <p>
                <strong>Supplier:</strong> {grn.supplier_name}
              </p>
              <p>
                <strong>Receipt Date:</strong> {grn.receipt_date}
              </p>
              {grn.remarks && (
                <p>
                  <strong>Remarks:</strong> {grn.remarks}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header fw-bold">Summary</div>
            <div className="card-body">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge bg-${
                    grn.status === "draft" ? "secondary" : "success"
                  }`}
                >
                  {grn.status}
                </span>
              </p>
              <p>
                <strong>Total Items:</strong> {grn.items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card shadow-sm mt-4">
        <div className="card-header fw-bold">Received Items</div>
        <div className="card-body table-responsive">
          {(!grn.items || grn.items.length === 0) ? (
            <p className="text-muted">No items found for this GRN.</p>
          ) : (
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
                {grn.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      {item.item_name} ({item.item_code})
                    </td>
                    <td>{item.ordered_qty}</td>
                    <td>{item.received_qty}</td>
                    <td>{item.uom}</td>
                    <td>{item.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
