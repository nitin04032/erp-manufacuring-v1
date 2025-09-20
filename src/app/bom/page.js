"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BOMPage() {
  const [boms, setBoms] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load BOMs + items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bomRes, itemRes] = await Promise.all([
          fetch("/api/bom"),
          fetch("/api/items"),
        ]);
        setBoms(await bomRes.json());
        setItems(await itemRes.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
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
            <i className="bi bi-diagram-3 text-primary"></i> Bill of Materials (BOM)
          </h1>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createBOMModal">
            <i className="bi bi-plus-circle me-2"></i>Create BOM
          </button>
        </div>
      </div>

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
                  <p className="text-muted">Create your first Bill of Materials</p>
                  <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createBOMModal">
                    <i className="bi bi-plus-circle me-2"></i>Create First BOM
                  </button>
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
                          <td>{bom.product_name}</td>
                          <td>{bom.version}</td>
                          <td>
                            <span className={`badge bg-${bom.status === "active" ? "success" : "secondary"}`}>
                              {bom.status}
                            </span>
                          </td>
                          <td>{bom.components.length}</td>
                          <td>{new Date(bom.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link href={`/bom/${bom.id}`} className="btn btn-outline-primary" title="View">
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link href={`/bom/${bom.id}/edit`} className="btn btn-outline-secondary" title="Edit">
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

      {/* TODO: Modal for Create BOM (React Form) */}
    </div>
  );
}
