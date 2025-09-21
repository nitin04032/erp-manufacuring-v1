"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CurrentStockPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(true);

  // Load warehouses + stock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whRes, stockRes] = await Promise.all([
          fetch("/api/warehouses"),
          fetch(`/api/current-stock?search=${search}&warehouse_id=${warehouseId}`),
        ]);

        if (!whRes.ok || !stockRes.ok) throw new Error("Failed to load data");

        setWarehouses(await whRes.json());
        setCurrentStock(await stockRes.json());
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, warehouseId]);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-boxes text-primary"></i> Current Stock
          </h1>
          <Link href="/stock-adjustment" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i> Stock Adjustment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="row g-3"
              >
                {/* Warehouse */}
                <div className="col-md-3">
                  <label className="form-label">Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.warehouse_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="col-md-4">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Clear */}
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearch("");
                      setWarehouseId("");
                    }}
                  >
                    <i className="bi bi-x-circle"></i> Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : currentStock.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-boxes fs-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">No stock data found</h4>
                  <p className="text-muted">
                    Stock levels will appear here after transactions
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Location</th>
                        <th>Warehouse</th>
                        <th>Current Stock</th>
                        <th>Unit</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStock.map((stock, index) => (
                        <tr key={`${stock.id}-${stock.warehouse_name}-${index}`}>
                          <td>
                            <strong>{stock.item_code}</strong>
                          </td>
                          <td>{stock.item_name}</td>
                          <td>{stock.location_name || "-"}</td>
                          <td>{stock.warehouse_name}</td>
                          <td>
                            <strong
                              className={
                                stock.current_stock <= stock.reorder_level
                                  ? "text-danger"
                                  : "text-success"
                              }
                            >
                              {Number(stock.current_stock).toFixed(2)}
                            </strong>
                          </td>
                          <td>{stock.unit || "-"}</td>
                          <td>{Number(stock.reorder_level).toFixed(2)}</td>
                          <td>
                            {stock.current_stock <= 0 ? (
                              <span className="badge bg-danger">
                                Out of Stock
                              </span>
                            ) : stock.current_stock <= stock.reorder_level ? (
                              <span className="badge bg-warning">Low Stock</span>
                            ) : (
                              <span className="badge bg-success">In Stock</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
