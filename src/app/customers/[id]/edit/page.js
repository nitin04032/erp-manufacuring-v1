"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // fetch customer
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (res.ok) setCustomer(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomer();
  }, [id]);

  if (!customer) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setCustomer({ ...customer, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (res.ok) {
        setFlash({ type: "success", message: "Customer updated successfully!" });
        setTimeout(() => router.push(`/customers/${id}`), 1200);
      } else {
        setFlash({ type: "danger", message: "Error updating customer." });
      }
    } catch {
      setFlash({ type: "danger", message: "Server error." });
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-pencil text-primary"></i> Edit Customer
        </h1>
        <Link href={`/customers/${id}`} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
      </div>

      {flash.message && (
        <div className={`alert alert-${flash.type}`}>{flash.message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={customer.customer_name || ""}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={customer.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={customer.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={customer.status || "active"}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Update Customer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
