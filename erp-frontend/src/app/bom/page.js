"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BOMPage() {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [deleteId, setDeleteId] = useState(null);

  // Load BOMs
  const fetchData = async () => {
    try {
      const res = await fetch("/api/bom");
      if (res.ok) { 
        setBoms(await res.json());
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete BOM
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/bom/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFlash({ type: "success", message: "🗑️ BOM deleted successfully!" });
        setBoms(boms.filter((bom) => bom.id !== deleteId));
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.error || "Delete failed" });
      }
    } catch {
      setFlash({ type: "danger", message: "Server error while deleting BOM" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-diagram-3 text-primary"></i> Bill of Materials (BOM)
          </h1>
          <Link href="/bom/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Create BOM
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div
          className={`alert alert-${flash.type} alert-dismissible fade show`}
          role="alert"
        >
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* BOM List */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : boms.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-diagram-3 fs-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">No BOMs Created Yet</h5>
                  <p className="text-muted">
                    Create your first Bill of Materials
                  </p>
                  <Link href="/bom/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Create First BOM
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Finished Product</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Total Components</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boms.map((bom) => (
                        <tr key={bom.id}>
                          <td>
                            {bom.fg_name} ({bom.fg_code})
                          </td>
                          <td>{bom.version}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                bom.is_active ? "success" : "secondary"
                              }`}
                            >
                              {bom.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{bom.components_count}</td>
                          <td>
                            {new Date(bom.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/bom/${bom.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/bom/${bom.id}/edit`}
                                className="btn btn-outline-secondary"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                className="btn btn-outline-danger"
                                title="Delete"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteConfirmModal"
                                onClick={() => setDeleteId(bom.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this BOM? This action cannot be
              undone.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
