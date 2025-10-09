"use client";
import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// ✅ 1. Define detailed interfaces for all data structures
interface ItemOption {
  id: number;
  item_code: string;
  item_name: string;
}

interface WarehouseOption {
  id: number;
  name: string;
}

interface AdjustmentFormData {
  warehouse_id: number | "";
  item_id: number | "";
  adjustment_type: 'IN' | 'OUT';
  qty: number | string;
  reason: string;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

const CreateStockAdjustmentPage: FC = () => {
  const router = useRouter();

  // ✅ 2. Use strongly typed state
  const [formData, setFormData] = useState<AdjustmentFormData>({
    warehouse_id: "",
    item_id: "",
    adjustment_type: "IN",
    qty: "",
    reason: "",
  });

  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);

  // ✅ 3. Fetch initial data with authentication
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [itemsRes, warehousesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, { headers }),
        ]);

        if (!itemsRes.ok || !warehousesRes.ok) throw new Error("Failed to fetch data");

        setItems(await itemsRes.json());
        setWarehouses(await warehousesRes.json());
      } catch (error) {
        setFlash({ type: "danger", message: "Failed to load required data." });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 4. Implement a robust handleSubmit with better UX and error handling
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFlash({ type: "", message: "" });

    if (!formData.item_id || !formData.warehouse_id || !formData.adjustment_type || !formData.qty) {
      setFlash({ type: "danger", message: "Please fill all required fields." });
      setSubmitting(false);
      return;
    }

    const payload = {
        ...formData,
        warehouse_id: Number(formData.warehouse_id),
        item_id: Number(formData.item_id),
        qty: Number(formData.qty)
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock-adjustments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set("flashMessage", `Stock Adjustment ${data.adjustment_number} processed successfully!`, { path: "/" });
        Cookies.set("flashType", "success", { path: "/" });
        router.push("/stock-ledger"); // Redirect on success
      } else {
        const errorMessages = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setFlash({ type: "danger", message: errorMessages || "Error processing adjustment." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "A server error occurred. Please try again." });
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0"><i className="bi bi-arrow-down-up text-primary me-2"></i> Stock Adjustment</h1>
        <Link href="/stock-ledger" className="btn btn-secondary"><i className="bi bi-arrow-left me-2"></i> Back to Ledger</Link>
      </div>

      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`} role="alert">
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light"><h5 className="mb-0">Adjustment Details</h5></div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="warehouse_id" className="form-label">Warehouse *</label>
                    <select id="warehouse_id" name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} className="form-select" required>
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="item_id" className="form-label">Item *</label>
                    <select id="item_id" name="item_id" value={formData.item_id} onChange={handleChange} className="form-select" required>
                      <option value="">Select Item</option>
                      {items.map((item) => (<option key={item.id} value={item.id}>{item.item_code} - {item.item_name}</option>))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="adjustment_type" className="form-label">Adjustment Type *</label>
                    <select id="adjustment_type" name="adjustment_type" value={formData.adjustment_type} onChange={handleChange} className="form-select" required>
                      <option value="IN">Stock IN (Add to inventory)</option>
                      <option value="OUT">Stock OUT (Remove from inventory)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="qty" className="form-label">Quantity *</label>
                    <input type="number" id="qty" name="qty" value={formData.qty} onChange={handleChange} className="form-control" min="0.01" step="any" required />
                  </div>
                  <div className="col-12">
                    <label htmlFor="reason" className="form-label">Reason / Remarks *</label>
                    <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} className="form-control" rows={3} placeholder="e.g., Annual stock count correction, Damaged goods disposal" required></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <hr/>
                    <Link href="/stock-ledger" className="btn btn-secondary me-2">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Processing...' : <><i className="bi bi-check-circle me-2"></i>Process Adjustment</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateStockAdjustmentPage;