"use client";
import { useState, useEffect, FC } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

// Interface jo backend se match karti hai
interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email: string;
  is_active: boolean;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// Component jab koi data na ho
const NoDataDisplay: FC = () => (
  <div className="text-center py-5">
    <i className="bi bi-people fs-1 text-muted"></i>
    <h4 className="mt-3 text-muted">No suppliers found</h4>
    <p className="text-muted">Start by adding your first supplier.</p>
    <Link href="/suppliers/create" className="btn btn-primary">
      <i className="bi bi-plus-circle me-2"></i> Add Supplier
    </Link>
  </div>
);

const SuppliersPage: FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [totalCount, setTotalCount] = useState<number>(0);

  // useEffect server-side filtering aur debouncing handle karta hai
  useEffect(() => {
    // 500ms ke delay ke baad API call, taaki har keystroke par request na jaaye
    const handler = setTimeout(() => {
      fetchSuppliers();
    }, 500);

    return () => clearTimeout(handler);
  }, [status, search]); // Jab status ya search badlega, tab yeh effect chalega

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const query = new URLSearchParams({ status, search }).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/suppliers?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch suppliers");

      const data: Supplier[] = await response.json();
      setSuppliers(data);
      setTotalCount(data.length); // Update count
    } catch (err: any) {
      setFlash({ type: "danger", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        setFlash({ type: "success", message: "Supplier deleted successfully!" });
        fetchSuppliers(); // List ko refresh karo
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.message || "Delete failed" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "An error occurred." });
    }
  };

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-people text-primary"></i> Suppliers
          </h1>
          <Link href="/suppliers/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Add Supplier
          </Link>
        </div>
      </div>

      {/* Flash Messages */}
      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlash({ type: "", message: "" })}
          ></button>
        </div>
      )}

      {/* Filters Card */}
      <div className="card mb-4">
        <div className="card-body">
          <form className="row g-3">
            <div className="col-md-3">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="search" className="form-label">Search</label>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="Search by name, code, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setStatus("");
                  setSearch("");
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Suppliers Table Card */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-ul"></i> Suppliers List{" "}
            <span className="badge bg-primary ms-2">{totalCount}</span>
          </h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : suppliers.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Supplier Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.supplier_code}</strong></td>
                      <td>{s.name}</td>
                      <td>{s.contact_person || "-"}</td>
                      <td>{s.phone || "-"}</td>
                      <td>{s.email}</td>
                      <td>
                        <span className={`badge bg-${s.is_active ? "success" : "secondary"}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link href={`/suppliers/${s.id}/edit`} className="btn btn-outline-secondary" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button onClick={() => handleDelete(s.id)} className="btn btn-outline-danger" title="Delete">
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
  );
};

export default SuppliersPage;