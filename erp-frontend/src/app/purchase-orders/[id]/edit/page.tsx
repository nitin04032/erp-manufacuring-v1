"use client";
import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Interfaces
interface PurchaseOrderItem {
  id?: number;
  item_id: number | '';
  ordered_qty: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
}

interface PurchaseOrder {
  id: number;
  supplier_id: number | '';
  warehouse_id: number | '';
  po_date: string;
  expected_delivery_date: string;
  terms_and_conditions: string;
  remarks: string;
  status: 'draft' | 'sent';
  items: PurchaseOrderItem[];
}

interface Summary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface DropdownOption {
  id: number;
  name: string;
  item_name?: string;
  item_code?: string;
  purchase_rate?: number;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// Reusable Components
const LoadingSpinner: FC = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        <h4 className="ms-3 text-muted">Loading Form...</h4>
    </div>
);
const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-5">
        <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
        <h4 className="mt-3 text-danger">Could Not Load Data</h4>
        <p className="text-muted">{message}</p>
        <Link href="/purchase-orders" className="btn btn-primary"><i className="bi bi-arrow-left me-2"></i>Back to List</Link>
    </div>
);

const EditPurchaseOrderPage: FC = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [poData, setPoData] = useState<Partial<PurchaseOrder>>({});
  const [summary, setSummary] = useState<Summary>({ subtotal: 0, discount: 0, tax: 0, total: 0 });
  const [suppliers, setSuppliers] = useState<DropdownOption[]>([]);
  const [warehouses, setWarehouses] = useState<DropdownOption[]>([]);
  const [items, setItems] = useState<DropdownOption[]>([]);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };
            const [poRes, supRes, whRes, itemRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`, { headers }),
            ]);

            if (!poRes.ok) throw new Error("Purchase Order not found.");
            
            const poResult = await poRes.json();
            poResult.po_date = poResult.po_date ? new Date(poResult.po_date).toISOString().split('T')[0] : '';
            poResult.expected_delivery_date = poResult.expected_delivery_date ? new Date(poResult.expected_delivery_date).toISOString().split('T')[0] : '';
            
            setPoData(poResult);
            if (supRes.ok) setSuppliers(await supRes.json());
            if (whRes.ok) setWarehouses(await whRes.json());
            if (itemRes.ok) setItems(await itemRes.json());
        } catch (err: any) {
            setFlash({ type: 'danger', message: err.message || 'Failed to load data.' });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id]);
  
  const handleHeaderChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPoData(prev => ({ ...prev, [id]: value }));
  };

  const handleItemChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!poData.items) return;
    const { name, value, type } = e.target;
    const newItems = [...poData.items];
    const itemRow = newItems[index];
    
    // @ts-ignore
    itemRow[name] = type === 'number' ? parseFloat(value) || 0 : value;

    if (name === "item_id") {
      const selectedItem = items.find((i) => i.id == parseInt(value));
      if (selectedItem) {
        itemRow.unit_price = selectedItem.purchase_rate || 0;
      }
    }
    setPoData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => setPoData(prev => ({ ...prev, items: [...(prev?.items || []), { item_id: "", ordered_qty: 1, unit_price: 0, discount_percent: 0, tax_percent: 0 }]}));
  const removeItemRow = (index: number) => setPoData(prev => ({ ...prev, items: prev?.items?.filter((_, i) => i !== index)}));
  
  useEffect(() => {
    if (!poData.items) return;
    let subtotal = 0, totalDiscount = 0, totalTax = 0;
    poData.items.forEach(row => {
      const lineAmount = row.ordered_qty * row.unit_price;
      const discountAmount = (lineAmount * row.discount_percent) / 100;
      const taxableAmount = lineAmount - discountAmount;
      const taxAmount = (taxableAmount * row.tax_percent) / 100;
      subtotal += lineAmount;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    });
    setSummary({ subtotal, discount: totalDiscount, tax: totalTax, total: subtotal - totalDiscount + totalTax });
  }, [poData.items]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!poData.supplier_id || !poData.warehouse_id || !poData.items || poData.items.length === 0) {
      setFlash({ type: "danger", message: "Supplier, Warehouse, and at least one item are required." });
      return;
    }
    setSubmitting(true);
    
    const dataToSend = {
      ...poData,
      supplier_id: Number(poData.supplier_id),
      warehouse_id: Number(poData.warehouse_id),
      items: poData.items.map(item => ({...item, item_id: Number(item.item_id)})),
      subtotal: summary.subtotal,
      discount_amount: summary.discount,
      tax_amount: summary.tax,
      total_amount: summary.total,
    };

    try {
      const token = Cookies.get("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        router.push(`/purchase-orders/${id}?updated=true`);
      } else {
        const err = await res.json();
        setFlash({ type: "danger", message: err.message || "Failed to update PO." });
      }
    } catch (error: any) { // ✅ FIX: 'catch' block mein '(error: any)' add kiya gaya hai
      setFlash({ type: "danger", message: "Server error. Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };
  
  const calculateLineTotal = (row: PurchaseOrderItem) => {
    const lineAmount = row.ordered_qty * row.unit_price;
    const discountAmount = (lineAmount * row.discount_percent) / 100;
    const taxableAmount = lineAmount - discountAmount;
    const taxAmount = (taxableAmount * row.tax_percent) / 100;
    return (taxableAmount + taxAmount).toFixed(2);
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!poData || !poData.id) return <ErrorDisplay message="Could not load purchase order data." />;

  return (
    <div className="container-fluid">
        <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0"><i className="bi bi-pencil text-primary"></i> Edit Purchase Order</h1>
                <Link href={`/purchase-orders/${id}`} className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"></i> Back to Details</Link>
            </div>
        </div>

        {flash.message && (
            <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
                {flash.message}
                <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
            </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
            <div className="card mb-4">
                <div className="card-header"><h5 className="mb-0">Purchase Order Details</h5></div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label htmlFor="supplier_id" className="form-label">Supplier *</label>
                            <select id="supplier_id" className="form-select" required value={poData.supplier_id} onChange={handleHeaderChange}>
                                <option value="">Select Supplier</option>
                                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label htmlFor="warehouse_id" className="form-label">Warehouse *</label>
                            <select id="warehouse_id" className="form-select" required value={poData.warehouse_id} onChange={handleHeaderChange}>
                                <option value="">Select Warehouse</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2 mb-3">
                            <label htmlFor="po_date" className="form-label">PO Date *</label>
                            <input type="date" id="po_date" className="form-control" required value={poData.po_date} onChange={handleHeaderChange} />
                        </div>
                        <div className="col-md-2 mb-3">
                            <label htmlFor="expected_delivery_date" className="form-label">Expected Delivery</label>
                            <input type="date" id="expected_delivery_date" className="form-control" value={poData.expected_delivery_date} onChange={handleHeaderChange} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Items</h5>
                    <button type="button" className="btn btn-sm btn-success" onClick={addItemRow}><i className="bi bi-plus-circle me-2"></i>Add Item</button>
                </div>
                <div className="card-body">
                    {poData.items?.length === 0 
                        ? <p className="text-center text-muted py-3">No items added yet.</p>
                        : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{width: "25%"}}>Item</th>
                                        <th style={{width: "10%"}}>Qty</th>
                                        <th style={{width: "15%"}}>Unit Price</th>
                                        <th style={{width: "10%"}}>Discount %</th>
                                        <th style={{width: "10%"}}>Tax %</th>
                                        <th style={{width: "15%"}} className="text-end">Line Total</th>
                                        <th style={{width: "5%"}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                {poData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td><select name="item_id" className="form-select" value={item.item_id} onChange={(e) => handleItemChange(index, e)} required><option value="">Select Item</option>{items.map(it => <option key={it.id} value={it.id}>{it.item_name} ({it.item_code})</option>)}</select></td>
                                        <td><input type="number" name="ordered_qty" className="form-control" value={item.ordered_qty} onChange={(e) => handleItemChange(index, e)} min="1" required/></td>
                                        <td><input type="number" name="unit_price" className="form-control" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01" required/></td>
                                        <td><input type="number" name="discount_percent" className="form-control" value={item.discount_percent} onChange={(e) => handleItemChange(index, e)} min="0" max="100"/></td>
                                        <td><input type="number" name="tax_percent" className="form-control" value={item.tax_percent} onChange={(e) => handleItemChange(index, e)} min="0"/></td>
                                        <td className="text-end align-middle"><strong>₹{calculateLineTotal(item)}</strong></td>
                                        <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeItemRow(index)}><i className="bi bi-trash"></i></button></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="mb-3">
                                <label htmlFor="terms_and_conditions" className="form-label">Terms & Conditions</label>
                                <textarea id="terms_and_conditions" className="form-control" rows={2} value={poData.terms_and_conditions} onChange={handleHeaderChange}></textarea>
                            </div>
                            <div className="mb-0">
                                <label htmlFor="remarks" className="form-label">Remarks</label>
                                <textarea id="remarks" className="form-control" rows={2} value={poData.remarks} onChange={handleHeaderChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2"><span>Subtotal:</span><span>₹{summary.subtotal.toFixed(2)}</span></div>
                            <div className="d-flex justify-content-between mb-2"><span>Discount:</span><span>₹{summary.discount.toFixed(2)}</span></div>
                            <div className="d-flex justify-content-between mb-2"><span>Tax:</span><span>₹{summary.tax.toFixed(2)}</span></div>
                            <hr/>
                            <div className="d-flex justify-content-between h5"><strong>Total:</strong><strong>₹{summary.total.toFixed(2)}</strong></div>
                            <hr/>
                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Updating...' : <><i className="bi bi-check-circle me-2"></i>Update Purchase Order</>}
                                </button>
                                <Link href={`/purchase-orders/${id}`} className="btn btn-outline-secondary">Cancel</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
  );
};

export default EditPurchaseOrderPage;