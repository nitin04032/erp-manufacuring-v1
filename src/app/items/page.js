"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (err) {
        setFlash({ type: "danger", message: "Error fetching items." });
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-box text-primary"></i> Items
          </h1>
          <Link href="/items/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Add Item
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.type === "success" && <i className="bi bi-check-circle me-2"></i>}
          {flash.type === "danger" && <i className="bi bi-exclamation-triangle me-2"></i>}
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Items Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-box fs-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No items found</h4>
                  <p className="text-muted">Start by adding your first item</p>
                  <Link href="/items/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i> Add Item
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Item Name</th>
                        <th>Description</th>
                        <th>Unit</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.item_code}</strong>
                          </td>
                          <td>{item.item_name}</td>
                          <td>{item.description || ""}</td>
                          <td>{item.unit}</td>
                          <td>{item.category || ""}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                item.status === "active" ? "success" : "secondary"
                              }`}
                            >
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                href={`/items/${item.id}`}
                                className="btn btn-outline-primary"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                href={`/items/${item.id}/edit`}
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
