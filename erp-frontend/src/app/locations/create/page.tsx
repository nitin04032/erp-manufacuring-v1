"use client";
import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// ✅ 1. Data ke liye TypeScript interfaces define karein
interface LocationFormData {
  location_name: string;
  location_code: string; // Isse frontend se nahi bhejenge
  warehouse_id: number | ''; // Dropdown ke liye '' allow karein
  description: string;
  is_active: boolean;
}

interface Warehouse {
  id: number;
  name: string; // Warehouse ka naam
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// ✅ 2. Component ko FC (Functional Component) mein convert karein
const CreateLocationPage: FC = () => {
  const router = useRouter();

  const initialFormState: LocationFormData = {
    location_name: "",
    location_code: "",
    warehouse_id: '',
    description: "",
    is_active: true,
  };

  const [form, setForm] = useState<LocationFormData>(initialFormState);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ✅ 3. Warehouse dropdown ke liye data fetch karein
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Warehouse[] = await res.json();
          setWarehouses(data);
        }
      } catch (error) {
        setFlash({ type: 'danger', message: 'Could not load warehouses.' });
      }
    };
    fetchWarehouses();
  }, []);

  // ✅ 4. Behtar, typed handleChange function
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    // Warehouse ID ko number mein convert karein
    const parsedValue = id === 'warehouse_id' ? parseInt(value) || '' : value;
    setForm({ ...form, [id]: parsedValue });
  };

  // ✅ 5. Submit logic ko update karein
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.location_name || !form.warehouse_id) {
        setFlash({ type: 'danger', message: 'Location Name and Warehouse are required.' });
        return;
    }
    setSubmitting(true);

    // Frontend se location_code na bhejें
    const { location_code, ...dataToSend } = form;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        router.push("/locations?created=true");
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.message || "Failed to create location" });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0"><i className="bi bi-plus-circle text-primary"></i> Create Location</h1>
          <Link href="/locations" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"></i> Back to List</Link>
        </div>
      </div>

      {/* Flash Messages */}
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
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Location Details</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="location_name" className="form-label">Location Name <span className="text-danger">*</span></label>
                    <input type="text" id="location_name" className="form-control" required value={form.location_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="location_code" className="form-label">Location Code</label>
                    <input type="text" id="location_code" className="form-control" value="Will be auto-generated" readOnly disabled />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="warehouse_id" className="form-label">Warehouse <span className="text-danger">*</span></label>
                    <select id="warehouse_id" className="form-select" required value={form.warehouse_id} onChange={handleChange}>
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea id="description" className="form-control" rows={3} value={form.description} onChange={handleChange}></textarea>
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
                  <label htmlFor="is_active" className="form-label">Status</label>
                  <select id="is_active" className="form-select" value={String(form.is_active)} onChange={(e) => setForm({...form, is_active: e.target.value === 'true'})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Location'}
                  </button>
                  <Link href="/locations" className="btn btn-outline-secondary">Cancel</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLocationPage;