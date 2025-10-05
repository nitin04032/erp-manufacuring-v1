"use client";
import { useState, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Interface remains the same as it correctly defines the data structure
interface ItemFormData {
  item_code: string;
  item_name: string;
  item_type: 'raw_material' | 'semi_finished' | 'finished_goods' | 'consumable' | 'service';
  item_category: string;
  unit: string;
  hsn_code: string;
  gst_rate: number;
  purchase_rate: number;
  sale_rate: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_level: number;
  is_active: boolean;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

const CreateItemPage: FC = () => {
  const router = useRouter();

  const initialFormState: ItemFormData = {
    item_code: "", // Stays as an empty string in the initial state
    item_name: "",
    item_type: "raw_material",
    item_category: "",
    unit: "pcs",
    hsn_code: "",
    gst_rate: 0,
    purchase_rate: 0,
    sale_rate: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    reorder_level: 0,
    is_active: true,
  };

  const [form, setForm] = useState<ItemFormData>(initialFormState);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, is_active: e.target.value === 'true' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation now only checks for item_name
    if (!form.item_name) {
        setFlash({ type: "danger", message: "Item Name is a required field." });
        return;
    }
    setSubmitting(true);

    // ✅ Key Change: Exclude item_code from the data sent to the backend.
    const { item_code, ...dataToSend } = form;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(dataToSend), // Send the data without the item_code field
      });

      if (res.ok) {
        router.push("/items?created=true");
      } else {
        const errorData = await res.json();
        setFlash({ type: "danger", message: errorData.message || "Failed to create item." });
      }
    } catch {
      setFlash({ type: "danger", message: "Server error while creating item." });
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header and Flash Messages remain the same */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0"><i className="bi bi-plus-circle text-primary"></i> Create Item</h1>
          <Link href="/items" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"></i> Back to List</Link>
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
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Item Details</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_name" className="form-label">Item Name <span className="text-danger">*</span></label>
                    <input type="text" id="item_name" className="form-control" value={form.item_name} onChange={handleChange} required />
                  </div>
                  
                  {/* ✅ Key Change: Item Code field is now disabled and read-only */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_code" className="form-label">Item Code</label>
                    <input 
                      type="text" 
                      id="item_code" 
                      className="form-control" 
                      value="Will be auto-generated" 
                      readOnly 
                      disabled 
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_type" className="form-label">Item Type</label>
                    <select id="item_type" className="form-select" value={form.item_type} onChange={handleChange}>
                      <option value="raw_material">Raw Material</option>
                      <option value="semi_finished">Semi Finished</option>
                      <option value="finished_goods">Finished Goods</option>
                      <option value="consumable">Consumable</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="item_category" className="form-label">Category</label>
                    <input type="text" id="item_category" className="form-control" value={form.item_category} onChange={handleChange} />
                  </div>
                   <div className="col-md-6 mb-3">
                    <label htmlFor="unit" className="form-label">Unit (UOM)</label>
                    <select id="unit" className="form-select" value={form.unit} onChange={handleChange}>
                      <option value="pcs">Pieces (Pcs)</option>
                      <option value="kg">Kilogram (Kg)</option>
                      <option value="ltr">Liter (Ltr)</option>
                      <option value="mtr">Meter (Mtr)</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                   <div className="col-md-6 mb-3">
                    <label htmlFor="hsn_code" className="form-label">HSN/SAC Code</label>
                    <input type="text" id="hsn_code" className="form-control" value={form.hsn_code} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Other cards for Pricing and Stock Management remain the same */}
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Pricing & Tax</h5></div>
              <div className="card-body">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="purchase_rate" className="form-label">Purchase Rate</label>
                        <input type="number" step="0.01" id="purchase_rate" className="form-control" value={form.purchase_rate} onChange={handleChange} />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="sale_rate" className="form-label">Sale Rate</label>
                        <input type="number" step="0.01" id="sale_rate" className="form-control" value={form.sale_rate} onChange={handleChange} />
                    </div>
                     <div className="col-md-4 mb-3">
                        <label htmlFor="gst_rate" className="form-label">GST Rate (%)</label>
                        <input type="number" step="0.01" id="gst_rate" className="form-control" value={form.gst_rate} onChange={handleChange} />
                    </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0">Stock Management</h5></div>
              <div className="card-body">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="minimum_stock" className="form-label">Minimum Stock</label>
                        <input type="number" id="minimum_stock" className="form-control" value={form.minimum_stock} onChange={handleChange} />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="maximum_stock" className="form-label">Maximum Stock</label>
                        <input type="number" id="maximum_stock" className="form-control" value={form.maximum_stock} onChange={handleChange} />
                    </div>
                     <div className="col-md-4 mb-3">
                        <label htmlFor="reorder_level" className="form-label">Reorder Level</label>
                        <input type="number" id="reorder_level" className="form-control" value={form.reorder_level} onChange={handleChange} />
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column for Status & Actions remains the same */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header"><h5 className="mb-0">Status & Actions</h5></div>
              <div className="card-body">
                <div className="mb-3">
                    <label htmlFor="is_active" className="form-label">Status</label>
                    <select id="is_active" className="form-select" value={String(form.is_active)} onChange={handleStatusChange}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
                <hr/>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                    ) : (
                        <><i className="bi bi-check-circle me-2"></i> Create Item</>
                    )}
                  </button>
                  <Link href="/items" className="btn btn-outline-secondary">
                    <i className="bi bi-x-circle me-2"></i> Cancel
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

export default CreateItemPage;