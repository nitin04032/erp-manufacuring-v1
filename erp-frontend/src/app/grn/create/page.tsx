"use client";
import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Interfaces for data structures
interface SupplierOption {
  id: number;
  name: string;
}

interface PurchaseOrderOption {
  id: number;
  po_number: string;
  supplier_name: string;
}

interface GRNItem {
  item_id: number;
  item_name: string;
  item_code: string;
  uom: string;
  ordered_qty: number;
  received_qty: number | string;
  remarks: string;
}

interface GRNFormData {
  supplier_id: number | "";
  purchase_order_id: number | "";
  grn_date: string;
  invoice_number: string;
  remarks: string;
  warehouse_name: string; // Added for payload
}

// Added warehouse_name to match backend requirements
interface FullPurchaseOrder {
  supplier_id: number;
  warehouse_name: string; 
  items: Array<{
    item_id: number;
    item_name: string;
    item_code: string;
    uom: string;
    ordered_qty: number;
  }>;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

const CreateGRNPage: FC = () => {
  const router = useRouter();
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Data for dropdowns and tables
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderOption[]>([]);
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);

  // Form state
  const [form, setForm] = useState<GRNFormData>({
    supplier_id: "",
    purchase_order_id: "",
    grn_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    remarks: "",
    warehouse_name: "", // Initialize
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [supRes, poRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders?status=acknowledged`, { headers }),
        ]);
        if (supRes.ok) setSuppliers(await supRes.json());
        if (poRes.ok) setPurchaseOrders(await poRes.json());
      } catch (err) {
        setFlash({ type: 'danger', message: 'Failed to load initial data.' });
      }
    };
    fetchData();
  }, []);

  // ✅ CORRECTED FUNCTION
  const handlePOChange = async (poId: string) => {
    const po_id_num = Number(poId);

    // If user selects the placeholder, reset everything
    if (!po_id_num) {
      setGrnItems([]);
      setForm(prev => ({
        ...prev,
        purchase_order_id: "",
        supplier_id: "",
        warehouse_name: "",
      }));
      return;
    }

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${po_id_num}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const po: FullPurchaseOrder = await res.json();
        
        // Perform a single, combined state update for the form
        setForm(prev => ({
          ...prev,
          purchase_order_id: po_id_num,
          supplier_id: po.supplier_id,
          warehouse_name: po.warehouse_name,
        }));

        // Update the items state
        setGrnItems(
          po.items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            item_code: item.item_code,
            uom: item.uom,
            ordered_qty: item.ordered_qty,
            received_qty: item.ordered_qty,
            remarks: "",
          }))
        );
      } else {
         setFlash({ type: 'danger', message: 'Failed to load details for the selected PO.' });
         setGrnItems([]); // Clear items on error
      }
    } catch (err) {
      setFlash({ type: 'danger', message: 'Error loading PO items.' });
    }
  };

  const handleItemChange = (index: number, field: keyof GRNItem, value: string | number) => {
    const updatedItems = [...grnItems];
    // @ts-ignore
    updatedItems[index][field] = value;
    setGrnItems(updatedItems);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFlash({ type: "", message: "" });

    if (!form.purchase_order_id || !form.grn_date || grnItems.length === 0) {
      setFlash({ type: "danger", message: "Purchase Order, GRN Date, and at least one item are required." });
      setSubmitting(false);
      return;
    }
    for (const row of grnItems) {
      if (Number(row.received_qty) < 0 || Number(row.received_qty) > Number(row.ordered_qty)) {
        setFlash({ type: "danger", message: `Invalid quantity for item ${row.item_name}.` });
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      purchaseOrderId: Number(form.purchase_order_id),
      received_date: form.grn_date,
      warehouse_name: form.warehouse_name,
      remarks: form.remarks,
      items: grnItems.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        received_qty: Number(item.received_qty),
        uom: item.uom,
      }))
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grn`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Cookies.set("flashMessage", `GRN ${data.receipt_number} created successfully!`, { path: "/" });
        Cookies.set("flashType", "success", { path: "/" });
        router.push("/grn");
      } else {
        const errorMessages = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setFlash({ type: "danger", message: errorMessages || "Failed to create GRN." });
      }
    } catch (err) {
      setFlash({ type: "danger", message: "Server error while creating GRN." });
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = grnItems.length;
  const totalOrdered = grnItems.reduce((sum, row) => sum + Number(row.ordered_qty || 0), 0);
  const totalReceived = grnItems.reduce((sum, row) => sum + Number(row.received_qty || 0), 0);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-box-arrow-in-down text-primary me-2"></i> Create GRN
        </h1>
        <Link href="/grn" className="btn btn-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back to List
        </Link>
      </div>

      {flash.message && (
        <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
          {flash.message}
          <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">GRN Details</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Purchase Order *</label>
                    <select id="purchase_order_id" className="form-select" value={form.purchase_order_id} onChange={(e) => handlePOChange(e.target.value)} required>
                      <option value="">Select Purchase Order</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.po_number} ({po.supplier_name})
                        </option>
                      ))}
                    </select>
                  </div>
                   <div className="col-md-6">
                    <label className="form-label">Supplier *</label>
                    <select id="supplier_id" className="form-select" value={form.supplier_id} onChange={handleChange} disabled>
                      <option value="">Select a PO to auto-fill</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">GRN Date *</label>
                    <input type="date" id="grn_date" className="form-control" value={form.grn_date} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Warehouse</label>
                    <input type="text" id="warehouse_name" className="form-control" value={form.warehouse_name} disabled readOnly />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea id="remarks" className="form-control" rows={2} value={form.remarks} onChange={handleChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light"><h5 className="mb-0">Summary</h5></div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">Total Items: <strong>{totalItems}</strong></li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">Total Ordered Qty: <strong>{totalOrdered}</strong></li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">Total Received Qty: <strong>{totalReceived}</strong></li>
                </ul>
                <hr />
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving...' : <><i className="bi bi-check-circle me-2"></i> Save GRN</>}
                    </button>
                    <Link href="/grn" className="btn btn-outline-secondary">
                        Cancel
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mt-4">
          <div className="card-header bg-light"><h5 className="mb-0">Received Items</h5></div>
          <div className="card-body">
            {!grnItems.length ? (
              <p className="text-muted text-center p-4">Select a Purchase Order to load items.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ width: '15%' }}>Ordered Qty</th>
                      <th style={{ width: '15%' }}>Received Qty</th>
                      <th style={{ width: '10%' }}>UOM</th>
                      <th style={{ width: '25%' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grnItems.map((row, i) => (
                      <tr key={i}>
                        <td>{row.item_name} <br/><small className="text-muted">{row.item_code}</small></td>
                        <td>{row.ordered_qty}</td>
                        <td>
                          <input type="number" min="0" max={row.ordered_qty} className="form-control" value={row.received_qty} onChange={(e) => handleItemChange(i, "received_qty", e.target.value)} required />
                        </td>
                        <td>{row.uom}</td>
                        <td>
                          <input type="text" className="form-control" value={row.remarks} onChange={(e) => handleItemChange(i, "remarks", e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGRNPage;