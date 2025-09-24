"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB");
}

export default function MaterialRequisitionList() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRequisitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, page]);

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (search) qs.set("search", search);
      qs.set("page", page);
      qs.set("pageSize", pageSize);
      const res = await fetch(`/api/material-requisition?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequisitions(data.rows || []);
        setTotal(data.total || 0);
      } else {
        console.error("Failed to fetch");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  function clearFilters() {
    setStatus("");
    setSearch("");
    setPage(1);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this requisition?")) return;
    const res = await fetch(`/api/material-requisition/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchRequisitions();
    } else {
      alert("Failed to delete");
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3"><i className="bi bi-clipboard-data text-primary"></i> Material Requisition</h1>
        <Link href="/material-requisition/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Create Requisition
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form className="row g-2" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchRequisitions(); }}>
            <div className="col-md-3">
              <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Search by requisition, requester or PO..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary w-50">Filter</button>
              <button type="button" className="btn btn-outline-secondary w-50" onClick={clearFilters}>Clear</button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          ) : requisitions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clipboard-data fs-1 text-muted"></i>
              <p className="mt-3 text-muted">No requisitions found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>No</th>
                      <th>Production Order</th>
                      <th>Requested By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.requisition_no}</strong></td>
                        <td>{r.production_order_no || "-"}</td>
                        <td>{r.requested_by_name || r.requested_by}</td>
                        <td>{formatDate(r.requisition_date)}</td>
                        <td>
                          <span className={`badge bg-${r.status === "draft" ? "secondary" : r.status === "submitted" ? "info" : r.status === "approved" ? "success" : "danger"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link href={`/material-requisition/${r.id}`} className="btn btn-outline-primary"><i className="bi bi-eye"></i></Link>
                            {r.status === "draft" && (
                              <>
                                <Link href={`/material-requisition/${r.id}/edit`} className="btn btn-outline-secondary"><i className="bi bi-pencil"></i></Link>
                                <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(r.id)}><i className="bi bi-trash"></i></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Showing {requisitions.length} of {total}</div>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page===1}>Prev</button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={requisitions.length < pageSize}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
