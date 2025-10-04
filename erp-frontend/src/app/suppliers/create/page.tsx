"use client";
import { useState, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // To redirect after success

// ✅ STEP 1: Define interfaces for our data structures
interface SupplierFormData {
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

// ✅ STEP 2: Convert the component to a typed Functional Component (FC)
const CreateSupplierPage: FC = () => {
  const router = useRouter();

  const initialFormState: SupplierFormData = {
    supplier_name: "",
    supplier_code: "",
    contact_person: "",
    email: "",
    phone: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    status: "active",
  };
  
  // ✅ STEP 3: Add types to all state hooks
  const [form, setForm] = useState<SupplierFormData>(initialFormState);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ✅ STEP 4: Create a single, typed handler for all form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  // ✅ STEP 5: Type the form submission event
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    if (!form.supplier_name || !form.contact_person) {
      setFlash({ type: "danger", message: "Supplier Name and Contact Person are required." });
      setSubmitting(false);
      return;
    }

    try {
      // Replace with your actual API endpoint and auth logic
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Redirect to the list page on success for better UX
        router.push("/suppliers?created=true"); 
      } else {
        const data = await res.json();
        const errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setFlash({ type: "danger", message: errorMessage || "Error creating supplier." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-plus-circle text-primary"></i> Create Supplier
          </h1>
          <Link href="/suppliers" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to List
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
                  <div className="col-md-6 mb-3">
                    <label htmlFor="supplier_name" className="form-label">Supplier Name <span className="text-danger">*</span></label>
                    <input type="text" id="supplier_name" className="form-control" required value={form.supplier_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="supplier_code" className="form-label">Supplier Code</label>
                    <input type="text" id="supplier_code" className="form-control" placeholder="Auto-generated if empty" value={form.supplier_code} onChange={handleChange} />
                  </div>
                   <div className="col-md-6 mb-3">
                    <label htmlFor="contact_person" className="form-label">Contact Person <span className="text-danger">*</span></label>
                    <input type="text" id="contact_person" className="form-control" required value={form.contact_person} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" id="email" className="form-control" value={form.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input type="text" id="phone" className="form-control" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gst_number" className="form-label">GST Number</label>
                    <input type="text" id="gst_number" className="form-control" value={form.gst_number} onChange={handleChange} />
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
                    <textarea id="address" className="form-control" rows={3} value={form.address} onChange={handleChange}></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">City</label>
                    <input type="text" id="city" className="form-control" value={form.city} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="state" className="form-label">State</label>
                    <input type="text" id="state" className="form-control" value={form.state} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input type="text" id="country" className="form-control" value={form.country} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="pincode" className="form-label">Pincode</label>
                    <input type="text" id="pincode" className="form-control" value={form.pincode} onChange={handleChange} />
                  </div>
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
                  <select id="status" className="form-select" value={form.status} onChange={handleChange}>
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
                      <><i className="bi bi-check-circle me-2"></i>Create Supplier</>
                    )}
                  </button>
                  <Link href="/suppliers" className="btn btn-outline-secondary">
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

export default CreateSupplierPage;