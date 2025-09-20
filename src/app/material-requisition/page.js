"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MaterialRequisitionList() {
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await fetch("/api/requisition"); // ✅ API call
      const data = await res.json();
      setRequisitions(data);
    } catch (err) {
      console.error("Error fetching requisitions", err);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-clipboard-data text-primary"></i> Material Requisition
          </h1>
          <Link href="/requisition/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create Requisition
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {requisitions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clipboard-data fs-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Material Requisitions Found</h4>
              <p className="text-muted">
                Start by creating your first requisition to request materials for production
              </p>
              <Link href="/requisition/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Create Requisition
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Requisition No</th>
                    <th>Production Order</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.requisition_no}</strong>
                      </td>
                      <td>{req.production_order_no || "N/A"}</td>
                      <td>{req.requested_by}</td>
                      <td>{new Date(req.requisition_date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            req.status === "draft"
                              ? "secondary"
                              : req.status === "submitted"
                              ? "info"
                              : req.status === "approved"
                              ? "success"
                              : "danger"
                          }`}
                        >
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/requisition/${req.id}`}
                            className="btn btn-outline-primary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          {req.status === "draft" && (
                            <Link
                              href={`/requisition/${req.id}/edit`}
                              className="btn btn-outline-secondary"
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                          )}
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
  );
}
