"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch customer details
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (res.ok) setCustomer(await res.json());
        else setFlash({ type: "danger", message: "Customer not found." });
      } catch (err) {
        console.error(err);
        setFlash({ type: "danger", message: "Error loading customer." });
      }
    };
    fetchCustomer();
  }, [id]);

  if (!customer) {
    return (
      <div className="container-fluid py-5 text-center">
        {flash.message ? (
          <div className={`alert alert-${flash.type}`}>{flash.message}</div>
        ) : (
          <div className="spinner-border text-primary"></div>
        )}
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-pencil text-primary"></i> Edit Customer
        </h1>
        <Link href={`/customers/${id}`} className="btn btn-secondary">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
      </div>

      {/* Flash message */}
      {flash.message && (
        <div className={`alert alert-${flash.type}`}>{flash.message}</div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            {/* Basic Info */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Customer Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.customer_code || ""}
                  readOnly
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.customer_name || ""}
                  onChange={(e) =>
                    handleChange("customer_name", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.contact_person || ""}
                  onChange={(e) =>
                    handleChange("contact_person", e.target.value)
                  }
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={customer.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                value={customer.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows="2"
              />
            </div>

            <div className="row">
              <div className="col-md-3 mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.pincode || ""}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.country || "India"}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
            </div>

            {/* Finance */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.gst_number || ""}
                  onChange={(e) => handleChange("gst_number", e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Credit Limit</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  value={customer.credit_limit || 0}
                  onChange={(e) => handleChange("credit_limit", e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Payment Terms</label>
                <input
                  type="text"
                  className="form-control"
                  value={customer.payment_terms || ""}
                  onChange={(e) =>
                    handleChange("payment_terms", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Status */}
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

            {/* Submit */}
            <button type="submit" className="btn btn-primary">
              Update Customer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
