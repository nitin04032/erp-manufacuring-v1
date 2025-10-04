"use client";
import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Assuming you use cookies for auth

// ✅ STEP 1: Define TypeScript interfaces for our data structures
interface Supplier {
  id: number;
  supplier_name: string;
  supplier_code: string;
  contact_person: string;
  email: string;
  phone: string;
  gst_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  status: "active" | "inactive";
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// ✅ STEP 2: Create reusable components for loading and error states
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
    <h4 className="mt-3 text-danger">Could Not Load Data</h4>
    <p className="text-muted">{message}</p>
    <Link href="/suppliers" className="btn btn-primary">
      <i className="bi bi-arrow-left me-2"></i>Back to Suppliers
    </Link>
  </div>
);

// ✅ STEP 3: Convert the main component to a typed FC
const EditSupplierPage: FC = () => {
  const { id } = useParams();
  const router = useRouter();

  // ✅ STEP 4: Add types to all state hooks
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });

  // Fetch supplier data to populate the form
  useEffect(() => {
    if (!id) return;
    
    const fetchSupplier = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Supplier not found.");
        }
        const data: Supplier = await res.json();
        setForm(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupplier();
  }, [id]);

  // ✅ STEP 5: Create a single, typed handler for all form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [id]: value }));
  };

  // ✅ STEP 6: Type the form submission event
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFlash({ type: "", message: "" });

    if (!form.supplier_name || !form.contact_person) {
      setFlash({ type: "danger", message: "Supplier Name and Contact Person are required." });
      setSubmitting(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
        method: "PATCH", // Using PATCH is better for updates
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        // Redirect to the details page with a success flag
        router.push(`/suppliers/${id}?updated=true`);
      } else {
        const data = await res.json();
        const errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setFlash({ type: "danger", message: errorMessage || "Error updating supplier." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "A server error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!form) return <ErrorDisplay message="Supplier data could not be loaded." />;
  
  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-pencil text-primary"></i> Edit Supplier
          </h1>
          <Link href={`/suppliers/${id}`} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i> Back to Details
          </Link>
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
          {/* Left Column: Details & Address */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Basic Information</h5></div>
              <div className="card-body">
                 <div className="row">
                  <div className="col-md-6 mb-3"><label htmlFor="supplier_name" className="form-label">Supplier Name <span className="text-danger">*</span></label><input type="text" id="supplier_name" className="form-control" required value={form.supplier_name || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="supplier_code" className="form-label">Supplier Code</label><input type="text" id="supplier_code" className="form-control" value={form.supplier_code || ''} readOnly disabled /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="contact_person" className="form-label">Contact Person <span className="text-danger">*</span></label><input type="text" id="contact_person" className="form-control" required value={form.contact_person || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="email" className="form-label">Email</label><input type="email" id="email" className="form-control" value={form.email || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="phone" className="form-label">Phone</label><input type="text" id="phone" className="form-control" value={form.phone || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="gst_number" className="form-label">GST Number</label><input type="text" id="gst_number" className="form-control" value={form.gst_number || ''} onChange={handleChange} /></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h5 className="mb-0">Address Information</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-3"><label htmlFor="address" className="form-label">Address</label><textarea id="address" className="form-control" rows={3} value={form.address || ''} onChange={handleChange}></textarea></div>
                  <div className="col-md-6 mb-3"><label htmlFor="city" className="form-label">City</label><input type="text" id="city" className="form-control" value={form.city || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="state" className="form-label">State</label><input type="text" id="state" className="form-control" value={form.state || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="country" className="form-label">Country</label><input type="text" id="country" className="form-control" value={form.country || ''} onChange={handleChange} /></div>
                  <div className="col-md-6 mb-3"><label htmlFor="pincode" className="form-label">Pincode</label><input type="text" id="pincode" className="form-control" value={form.pincode || ''} onChange={handleChange} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Actions */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Status & Actions</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" className="form-select" value={form.status || "active"} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>
                    ) : (
                      <><i className="bi bi-check-circle me-2"></i>Update Supplier</>
                    )}
                  </button>
                  <Link href={`/suppliers/${id}`} className="btn btn-outline-secondary">
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

export default EditSupplierPage;