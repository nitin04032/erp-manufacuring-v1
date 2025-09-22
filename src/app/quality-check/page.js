"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function QualityCheckList() {
  const [qcs, setQcs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch QC List
  useEffect(() => {
    const fetchQcs = async () => {
      try {
        const res = await fetch("/api/quality-checks");
        if (res.ok) {
          setQcs(await res.json());
        }
      } catch (err) {
        console.error("Error loading QC list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQcs();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-clipboard-check text-primary"></i> Quality Checks
        </h1>
        <Link href="/quality-check/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i> New Quality Check
        </Link>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : qcs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clipboard-check fs-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No Quality Checks Yet</h5>
              <p className="text-muted">Create your first QC to ensure standards</p>
              <Link href="/quality-check/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Create First QC
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>QC No</th>
                    <th>Date</th>
                    <th>Inspector</th>
                    <th>Status</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {qcs.map((qc) => (
                    <tr key={qc.id}>
                      <td><strong>{qc.qc_number}</strong></td>
                      <td>{new Date(qc.qc_date).toLocaleDateString()}</td>
                      <td>{qc.inspector}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            qc.status === "approved"
                              ? "success"
                              : qc.status === "rejected"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {qc.status.charAt(0).toUpperCase() + qc.status.slice(1)}
                        </span>
                      </td>
                      <td>{qc.items_count || 0}</td>
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
