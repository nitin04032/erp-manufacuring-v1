"use client";

import { useState, FC, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

// Form ke data ke liye type definition (Frontend state)
interface WarehouseFormData {
  warehouse_name: string;
  warehouse_code?: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contact_person: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

// Flash message ke liye type
interface FlashMessage {
    type: "success" | "danger" | "";
    message: string;
}

const CreateWarehousePage: FC = () => {
  const router = useRouter(); 

  const [form, setForm] = useState<Partial<WarehouseFormData>>({
    warehouse_name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    contact_person: "",
    phone: "",
    email: "",
    status: "active",
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  // ### MUKHYA SUDHAR YAHAN HAI: FORM SUBMISSION ###
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.warehouse_name) {
      setFlash({ type: "danger", message: "Warehouse Name is required." });
      return;
    }

    setSubmitting(true);
    setFlash({ type: "", message: "" });

    try {
      const token = Cookies.get('token');

      // Data ko backend ke format mein badla ja raha hai
      const dataToSend = {
          name: form.warehouse_name,
          // code yahan se nahi bhej rahe, backend generate karega
          description: form.description,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
          contact_person: form.contact_person,
          phone: form.phone,
          email: form.email,
          is_active: form.status === 'active', // 'status' ko 'is_active' (boolean) mein convert kiya
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, {
        method: "POST",
        body: JSON.stringify(dataToSend), // Sahi format wala data bheja ja raha hai
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
      });

      if (res.ok) {
        router.push("/warehouses");
      } else {
        const data = await res.json();
        // Agar ek se zyada error message hain, to unhe aache se dikhao
        const errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setFlash({ type: "danger", message: errorMessage || "Error creating warehouse." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Please try again later." });
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* (Baaki ka JSX code waisa hi rahega) */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Warehouse Details</h5></div>
              <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="warehouse_name" className="form-label">Warehouse Name <span className="text-danger">*</span></label>
                        <input type="text" id="warehouse_name" className="form-control" required value={form.warehouse_name || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="warehouse_code" className="form-label">Warehouse Code</label>
                        <input type="text" id="warehouse_code" className="form-control" readOnly value="Will be auto-generated" disabled />
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
                    <div className="col-12 mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea id="description" className="form-control" rows={3} value={form.description || ''} onChange={handleChange}></textarea>
                    </div>
                </div>
              </div>
            </div>
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
                  <select id="status" className="form-select" value={form.status || 'active'} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</>
                    ) : (
                        <><i className="bi bi-check-circle me-2"></i>Create Warehouse</>
                    )}
                  </button>
                  <Link href="/warehouses" className="btn btn-outline-secondary">
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateWarehousePage;