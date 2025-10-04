"use client";
import { useState, useEffect, FC } from "react";
import Link from "next/link";
import Cookies from "js-cookie"; // Assuming you use cookies for auth like in warehouses

// ✅ STEP 1: Define TypeScript Interfaces for data structures
interface Supplier {
  id: number;
  supplier_code: string;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  status: "active" | "inactive";
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// ✅ STEP 2: Create a reusable component for the empty state (like in warehouses)
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
  // ✅ STEP 3: Add types to all state variables
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });

  // Note: Your original code fetches all suppliers at once and filters on the client.
  // For larger datasets, consider server-side filtering like we did for warehouses.
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token"); // Example: using token for auth
        // Replace with your actual API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch suppliers data");
        }
        
        // ✅ Type the API response data
        const data: Supplier[] = await response.json();
        setSuppliers(data);
      } catch (err: any) {
        setFlash({ type: "danger", message: err.message || "Error loading suppliers." });
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // ✅ STEP 4: Add type to the function parameter
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        setFlash({ type: "success", message: "Supplier deleted successfully!" });
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.message || "Failed to delete" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "An error occurred while deleting." });
    }
  };

  // Client-side filtering logic from your original code
  const filteredSuppliers = suppliers.filter((s) => {
    const searchLower = search.toLowerCase();
    return (
      (status ? s.status === status : true) &&
      (search
        ? s.supplier_name?.toLowerCase().includes(searchLower) ||
          s.contact_person?.toLowerCase().includes(searchLower) ||
          s.supplier_code?.toLowerCase().includes(searchLower)
        : true)
    );
  });

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
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="search" className="form-label">Search</label>
                  <input type="text" id="search" className="form-control" placeholder="Search by name, code, contact..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setStatus(""); setSearch(""); }}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul"></i> Suppliers List{" "}
                <span className="badge bg-primary ms-2">{filteredSuppliers.length}</span>
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : filteredSuppliers.length === 0 ? (
                <NoDataDisplay />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Supplier Name</th>
                        <th>Contact Person</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.supplier_code}</strong></td>
                          <td>{s.supplier_name}</td>
                          <td>{s.contact_person || "-"}</td>
                          <td>{s.phone || "-"}</td>
                          <td>
                            <span className={`badge bg-${s.status === "active" ? "success" : "secondary"}`}>
                              {s.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link href={`/suppliers/${s.id}`} className="btn btn-outline-primary" title="View"><i className="bi bi-eye"></i></Link>
                              <Link href={`/suppliers/${s.id}/edit`} className="btn btn-outline-secondary" title="Edit"><i className="bi bi-pencil"></i></Link>
                              <button onClick={() => handleDelete(s.id)} className="btn btn-outline-danger" title="Delete"><i className="bi bi-trash"></i></button>
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
};

export default SuppliersPage;