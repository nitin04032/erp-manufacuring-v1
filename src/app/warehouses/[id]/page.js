"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function WarehouseDetailsPage() {
  const { id } = useParams();

  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({ type: "", message: "" });

  // Fetch warehouse details
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const res = await fetch(`/api/warehouses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setWarehouse(data);
        } else {
          setFlash({ type: "danger", message: "Warehouse not found." });
        }
      } catch (error) {
        setFlash({ type: "danger", message: "Failed to load warehouse details." });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWarehouse();
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!warehouse)
    return (
      <div className="container-fluid">
        {flash.message && (
          <div className={`alert alert-${flash.type}`}>{flash.message}</div>
        )}
      </div>
    );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-building text-primary"></i>{" "}
            Warehouse Details: {warehouse.warehouse_name}
          </h1>
          <div>
            <Link href="/warehouses" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-2"></i>Back to List
            </Link>
            <Link
              href={`/warehouses/${id}/edit`}
              className="btn btn-primary"
            >
              <i className="bi bi-pencil me-2"></i>Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Section */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Warehouse Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {[
                  { label: "Warehouse Code", value: warehouse.warehouse_code },
                  { label: "Warehouse Name", value: warehouse.warehouse_name },
                  {
                    label: "Description",
                    value: warehouse.description || "No description provided",
                    full: true,
                  },
                  {
                    label: "Address",
                    value: warehouse.address || "Not provided",
                    full: true,
                  },
                  { label: "City", value: warehouse.city || "Not provided" },
                  { label: "State", value: warehouse.state || "Not provided" },
                  {
                    label: "Contact Person",
                    value: warehouse.contact_person || "Not provided",
                  },
                  { label: "Phone", value: warehouse.phone || "Not provided" },
                ].map((field, i) => (
                  <div
                    className={`${field.full ? "col-12" : "col-md-6"} mb-3`}
                    key={i}
                  >
                    <label className="form-label fw-bold">{field.label}</label>
                    <p className="form-control-plaintext">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Status & Info</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Status</label>
                <p className="form-control-plaintext">
                  <span
                    className={`badge bg-${
                      warehouse.status === "active" ? "success" : "secondary"
                    }`}
                  >
                    {warehouse.status.charAt(0).toUpperCase() +
                      warehouse.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
