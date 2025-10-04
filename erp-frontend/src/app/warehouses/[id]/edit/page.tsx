"use client";

import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from 'js-cookie';

// Backend se aane wale data ke liye interface
interface Warehouse {
  id: number;
  code: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contact_person: string;
  phone: string;
  email: string;
  is_active: boolean;
}

// Reusable Components
const LoadingSpinner: FC = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="ms-3 text-muted">Loading Form...</h4>
    </div>
);

const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-5">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
        <h4 className="mt-3 text-danger">Could not load warehouse data</h4>
        <p className="text-muted">{message}</p>
        <Link href="/warehouses" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>Back to Warehouses
        </Link>
    </div>
);


const EditWarehousePage: FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<Partial<Warehouse>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [flash, setFlash] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchWarehouse = async () => {
      if (!id) return;
      try {
        const token = Cookies.get('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Warehouse not found.");
        }
        const data: Warehouse = await res.json();
        setForm(data);
      } catch (err: any) {
        setFlash({ type: 'danger', message: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, is_active: e.target.value === 'active' }));
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name) {
      setFlash({ type: "danger", message: "Warehouse Name is required." });
      return;
    }
    setSubmitting(true);
    setFlash({ type: "", message: "" });

    try {
      const token = Cookies.get('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push(`/warehouses/${id}`);
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.message || "Error updating warehouse." });
      }
    } catch (err: any) {
      setFlash({ type: "danger", message: err.message || "Server error. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!form.id) return <ErrorDisplay message={flash.message || 'Warehouse data could not be loaded.'} />;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-pencil text-primary"></i> Edit Warehouse
          </h1>
          <Link href={`/warehouses/${id}`} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to Details
          </Link>
        </div>
      </div>

      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Warehouse Details</h5></div>
              <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">Warehouse Name <span className="text-danger">*</span></label>
                        <input type="text" id="name" className="form-control" required value={form.name || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="code" className="form-label">Warehouse Code</label>
                        <input type="text" id="code" className="form-control" required value={form.code || ''} readOnly disabled />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="contact_person" className="form-label">Contact Person</label>
                        <input type="text" id="contact_person" className="form-control" value={form.contact_person || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input type="text" id="phone" className="form-control" value={form.phone || ''} onChange={handleChange} />
                    </div>
                     <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" className="form-control" value={form.email || ''} onChange={handleChange} />
                    </div>
                </div>
              </div>
            </div>
            
            {/* ### MUKHYA SUDHAR YAHAN HAI: MISSING FIELDS ADD KIYE GAYE ### */}
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Address Information</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea id="address" className="form-control" rows={3} value={form.address || ''} onChange={handleChange}></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">City</label>
                      <input type="text" id="city" className="form-control" value={form.city || ''} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                      <label htmlFor="state" className="form-label">State</label>
                      <input type="text" id="state" className="form-control" value={form.state || ''} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label">Country</label>
                      <input type="text" id="country" className="form-control" value={form.country || ''} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                      <label htmlFor="pincode" className="form-label">Pincode</label>
                      <input type="text" id="pincode" className="form-control" value={form.pincode || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Status</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" className="form-select" value={form.is_active ? 'active' : 'inactive'} onChange={handleStatusChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Warehouse'}
                  </button>
                  <Link href={`/warehouses/${id}`} className="btn btn-outline-secondary">Cancel</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditWarehousePage;