"use client";
import { useState, useEffect, FC, ChangeEvent } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

// ✅ 1. Define detailed interfaces for the ledger data
type TransactionType = 'purchase' | 'sale' | 'adjustment-in' | 'adjustment-out' | 'production-in' | 'production-out' | 'qc-rejection';

interface StockTransaction {
  id: number;
  transaction_date: string;
  item_code: string;
  item_name: string;
  warehouse_name: string;
  transaction_type: TransactionType;
  in_qty: number;
  out_qty: number;
  balance_qty: number;
  reference_type?: string;
  reference_id?: number;
  remarks?: string;
}

interface Filters {
  transaction_type: string;
  search: string;
}

interface FlashMessage {
  type: "success" | "danger" | "";
  message: string;
}

// ✅ 2. Reusable components for clean UI states
const NoDataDisplay: FC = () => (
  <div className="text-center py-5">
    <i className="bi bi-journal-x fs-1 text-muted"></i>
    <h4 className="mt-3 text-muted">No Stock Transactions Found</h4>
    <p className="text-muted">Stock movements from purchases, sales, and adjustments will appear here.</p>
  </div>
);

const LoadingSpinner: FC = () => (
  <div className="text-center py-5">
    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    <p className="mt-2 text-muted">Loading Ledger...</p>
  </div>
);

const StockLedgerPage: FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [flash, setFlash] = useState<FlashMessage>({ type: "", message: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 3. Implement debounced search for better performance
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    transaction_type: "",
    search: "",
  });

  // This effect debounces the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500); // Wait 500ms after user stops typing
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // This effect fetches data whenever the final filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        const query = new URLSearchParams(filters as any).toString();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock-ledger?${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch stock ledger.");
        setTransactions(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, transaction_type: e.target.value }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ transaction_type: "", search: "" });
  };

  const transactionTypeClass: Record<TransactionType, string> = {
    'purchase': "success",
    'sale': "danger",
    'adjustment-in': 'info',
    'adjustment-out': 'warning',
    'production-in': 'primary',
    'production-out': 'secondary',
    'qc-rejection': 'dark'
  };
  
  // ✅ 4. Function to create dynamic links for references
  const getReferenceLink = (type?: string, id?: number) => {
    if (!type || !id) return null;
    const path = type.toLowerCase().replace('_', '-');
    // Map backend types to frontend paths
    const pathMap: Record<string, string> = {
      'grn': '/grn',
      'purchaseorder': '/purchase-orders',
      'qualitycheck': '/quality-check',
      // Add other mappings here
    }
    const basePath = pathMap[path] || `/${path}`;
    return `${basePath}/${id}`;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0"><i className="bi bi-journal-text text-primary me-2"></i> Stock Ledger</h1>
        <Link href="/stock-adjustment/create" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i> New Adjustment</Link>
      </div>

      {flash.message && <div className={`alert alert-${flash.type}`}>{flash.message}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="transaction_type" className="form-label">Transaction Type</label>
              <select id="transaction_type" className="form-select" value={filters.transaction_type} onChange={handleTypeChange}>
                <option value="">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="adjustment-in">Adjustment In</option>
                <option value="adjustment-out">Adjustment Out</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="search" className="form-label">Search Item Code/Name</label>
              <input type="text" id="search" className="form-control" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g., ITEM-001 or 'Sample Item'" />
            </div>
            <div className="col-md-2">
              <button type="button" onClick={clearFilters} className="btn btn-outline-secondary w-100">
                <i className="bi bi-arrow-clockwise me-2"></i> Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0"><h5 className="mb-0">Transactions</h5></div>
        <div className="card-body">
          {loading ? <LoadingSpinner />
            : error ? <div className="alert alert-danger">{error}</div>
            : transactions.length === 0 ? <NoDataDisplay />
            : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Warehouse</th>
                    <th>Type</th>
                    <th className="text-end">In Qty</th>
                    <th className="text-end">Out Qty</th>
                    <th className="text-end">Balance</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const refLink = getReferenceLink(t.reference_type, t.reference_id);
                    return (
                    <tr key={t.id}>
                      <td>{new Date(t.transaction_date).toLocaleDateString("en-GB")}</td>
                      <td><strong>{t.item_name}</strong><br /><small className="text-muted">{t.item_code}</small></td>
                      <td>{t.warehouse_name}</td>
                      <td>
                        <span className={`badge bg-${transactionTypeClass[t.transaction_type] || 'light text-dark'} text-capitalize`}>
                          {t.transaction_type.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="text-end text-success fw-bold">{t.in_qty > 0 ? `+${t.in_qty.toLocaleString()}` : "-"}</td>
                      <td className="text-end text-danger fw-bold">{t.out_qty > 0 ? `-${t.out_qty.toLocaleString()}` : "-"}</td>
                      <td className="text-end fw-bold">{t.balance_qty.toLocaleString()}</td>
                      <td>
                        {refLink ? (
                           <Link href={refLink} className="text-decoration-none" title={`View ${t.reference_type}`}>
                            {t.reference_type} #{t.reference_id} <i className="bi bi-box-arrow-up-right small"></i>
                           </Link>
                        ) : t.reference_type ? (
                            `${t.reference_type} #${t.reference_id}`
                        ) : 'N/A'}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockLedgerPage;