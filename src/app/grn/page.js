"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GRNPage() {
  const [grns, setGrns] = useState([]);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch GRNs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/grn");
        if (res.ok) {
          setGrns(await res.json());
        } else {
          setGrns([]);
        }
      } catch (err) {
        setGrns([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-box-arrow-in-down text-primary"></i> Goods Receipt
            Note (GRN)
          </h1>
          <Link href="/grn/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create GRN
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

      {/* GRN List */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {grns.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-box-arrow-in-down fs-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">No GRNs Created Yet</h5>
                  <p className="text-muted">
                    Create your first Goods Receipt Note to record incoming
                    materials
                  </p>
                  <Link href="/grn/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Create First GRN
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>GRN No</th>
                        <th>PO Reference</th>
                        <th>Supplier</th>
                        <th>Received Date</th>
                        <th>Total Items</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grns.map((grn) => (
                        <tr key={grn.id}>
                          <td>
                            <strong>{grn.grn_number}</strong>
                          </td>
                          <td>{grn.po_number}</td>
                          <td>{grn.supplier_name}</td>
                          <td>{grn.grn_date}</td>
                          <td>{grn.items?.length || 0}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                grn.status === "draft" ? "secondary" : "success"
                              }`}
                            >
                              {grn.status.charAt(0).toUpperCase() +
                                grn.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/grn/${grn.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/grn/${grn.id}/edit`}
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
    </div>
  );
}
