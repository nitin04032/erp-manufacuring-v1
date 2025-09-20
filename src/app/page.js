"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [today, setToday] = useState("");
  const [stats, setStats] = useState({
    suppliers: 0,
    items: 0,
    warehouses: 0,
    locations: 0,
  });
  const [dbStatus, setDbStatus] = useState(false);

  // ✅ Client-only date fix
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    setToday(formatted);
  }, []);

  // ✅ Fetch system stats & db status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/system/status"); // create this API
        const data = await res.json();
        setStats(data.stats);
        setDbStatus(data.dbStatus);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-speedometer2 text-primary"></i> Dashboard
          </h1>
          <div className="text-muted">
            <i className="bi bi-calendar-event"></i> {today || "Loading..."}
          </div>
        </div>
      </div>

      {/* Database Status */}
      {!dbStatus ? (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle"></i>{" "}
              <strong>Database Connection Issue:</strong> Please ensure MySQL is
              running and the database <code>manufacturing_erp</code> exists.
              <button
                onClick={() => location.reload()}
                className="btn btn-sm btn-outline-warning ms-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle"></i>{" "}
              <strong>System Status:</strong> All systems operational. Database
              connected successfully.
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card">
            <div className="card-body d-flex align-items-center">
              <div className="dashboard-icon bg-light-primary text-primary me-3">
                <i className="bi bi-people"></i>
              </div>
              <div>
                <h5 className="card-title mb-1">{stats.suppliers}</h5>
                <p className="card-text text-muted mb-0">Suppliers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card dashboard-card">
            <div className="card-body d-flex align-items-center">
              <div className="dashboard-icon bg-light-success text-success me-3">
                <i className="bi bi-box"></i>
              </div>
              <div>
                <h5 className="card-title mb-1">{stats.items}</h5>
                <p className="card-text text-muted mb-0">Items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card dashboard-card">
            <div className="card-body d-flex align-items-center">
              <div className="dashboard-icon bg-light-warning text-warning me-3">
                <i className="bi bi-building"></i>
              </div>
              <div>
                <h5 className="card-title mb-1">{stats.warehouses}</h5>
                <p className="card-text text-muted mb-0">Warehouses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card dashboard-card">
            <div className="card-body d-flex align-items-center">
              <div className="dashboard-icon bg-light-danger text-danger me-3">
                <i className="bi bi-geo-alt"></i>
              </div>
              <div>
                <h5 className="card-title mb-1">{stats.locations}</h5>
                <p className="card-text text-muted mb-0">Locations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning"></i> Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <a href="#" className="btn btn-outline-primary w-100">
                    <i className="bi bi-plus-circle me-2"></i> New Supplier
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a href="#" className="btn btn-outline-success w-100">
                    <i className="bi bi-plus-circle me-2"></i> New Item
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a
                    href="/purchase-orders/create"
                    className="btn btn-outline-warning w-100"
                  >
                    <i className="bi bi-cart-plus me-2"></i> New Purchase Order
                  </a>
                </div>
                <div className="col-md-3 mb-2">
                  <a href="#" className="btn btn-outline-info w-100">
                    <i className="bi bi-clipboard-check me-2"></i> Quality Check
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & System Info */}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history"></i> Recent Activity
              </h5>
            </div>
            <div className="card-body">
              {dbStatus ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-list-ul display-4"></i>
                  <p className="mt-3">No recent activity to display.</p>
                  <p className="small">
                    Activity will appear here once you start using the system.
                  </p>
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> Recent activity will be
                  available once the database connection is established.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle"></i> System Information
              </h5>
            </div>
            <div className="card-body small">
              <div className="d-flex justify-content-between mb-2">
                <span>Application:</span>
                <span className="text-primary">Manufacturing ERP</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Database:</span>
                <span className={dbStatus ? "text-success" : "text-danger"}>
                  {dbStatus ? "Connected" : "Not Connected"}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Server Time:</span>
                <span>{today}</span>
              </div>
              <hr />
              <div className="text-center">
                <h6 className="text-primary">Manufacturing ERP Modules</h6>
                <div className="small text-muted">
                  <div>✓ Masters (Suppliers, Items, Warehouses)</div>
                  <div>⏳ Purchase Orders & GRN</div>
                  <div>⏳ Quality Control</div>
                  <div>⏳ Stock Management</div>
                  <div>⏳ Production & BOM</div>
                  <div>⏳ Dispatch & Invoicing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions if DB not connected */}
      {!dbStatus && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-tools"></i> Setup Instructions
                </h5>
              </div>
              <div className="card-body">
                <h6>To get started, please complete the following steps:</h6>
                <ol>
                  <li>Ensure XAMPP is running with Apache and MySQL</li>
                  <li>
                    Open phpMyAdmin:{" "}
                    <a
                      href="http://localhost/phpmyadmin"
                      target="_blank"
                      rel="noreferrer"
                    >
                      http://localhost/phpmyadmin
                    </a>
                  </li>
                  <li>
                    Create a new database named:{" "}
                    <code>manufacturing_erp</code>
                  </li>
                  <li>
                    Import the schema file:{" "}
                    <code>C:\xampp\htdocs\mfg\migrations\001_schema.sql</code>
                  </li>
                  <li>Refresh this page to verify the connection</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
