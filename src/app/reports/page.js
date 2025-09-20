"use client";

import Link from "next/link";

export default function ReportsDashboard() {
  // Placeholder functions
  const exportData = () => alert("Export functionality will be implemented.");
  const generateWeeklyReport = () =>
    alert("Weekly report generation feature.");
  const generateMonthlyReport = () =>
    alert("Monthly report generation feature.");
  const showAlerts = () =>
    alert("Critical alerts will show low stock and overdue orders.");
  const importSuppliers = () => alert("Import suppliers from CSV/Excel.");
  const importItems = () => alert("Import items from CSV/Excel.");
  const importStock = () => alert("Import stock from CSV/Excel.");
  const exportToCSV = () => alert("Export to CSV.");
  const exportToExcel = () => alert("Export to Excel.");
  const exportToPDF = () => alert("Export to PDF.");

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-graph-up text-primary"></i> Reports & Analytics
          </h1>
          <button className="btn btn-outline-primary" onClick={exportData}>
            <i className="bi bi-download me-2"></i>Export Data
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="row">
        {/* Inventory */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-boxes display-1 text-primary mb-3"></i>
              <h5 className="card-title">Inventory Reports</h5>
              <p className="text-muted">
                Stock levels, movements, and warehouse analytics
              </p>
              <div className="d-grid gap-2">
                <Link href="/reports/inventory" className="btn btn-primary">
                  <i className="bi bi-graph-up me-2"></i>View Reports
                </Link>
                <Link href="/current-stock" className="btn btn-outline-primary">
                  <i className="bi bi-list me-2"></i>Current Stock
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-cart-check display-1 text-success mb-3"></i>
              <h5 className="card-title">Purchase Reports</h5>
              <p className="text-muted">
                Purchase orders, supplier performance, and spend analysis
              </p>
              <div className="d-grid gap-2">
                <Link href="/reports/purchase" className="btn btn-success">
                  <i className="bi bi-graph-up me-2"></i>View Reports
                </Link>
                <Link
                  href="/purchase-orders"
                  className="btn btn-outline-success"
                >
                  <i className="bi bi-list me-2"></i>All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-gear-wide-connected display-1 text-warning mb-3"></i>
              <h5 className="card-title">Production Reports</h5>
              <p className="text-muted">
                Production efficiency, order status, and utilization
              </p>
              <div className="d-grid gap-2">
                <Link href="/reports/production" className="btn btn-warning">
                  <i className="bi bi-graph-up me-2"></i>View Reports
                </Link>
                <Link
                  href="/production-orders"
                  className="btn btn-outline-warning"
                >
                  <i className="bi bi-list me-2"></i>All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Analytics */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-speedometer2 text-info me-2"></i>
                Quick Analytics
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <h4 className="text-primary">
                    <i className="bi bi-trend-up"></i> Daily Operations
                  </h4>
                  <p className="text-muted">Track today's activities</p>
                  <Link
                    href="/dashboard"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Dashboard
                  </Link>
                </div>
                <div className="col-md-3 mb-3">
                  <h4 className="text-success">
                    <i className="bi bi-calendar-check"></i> Weekly Summary
                  </h4>
                  <p className="text-muted">This week's performance</p>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={generateWeeklyReport}
                  >
                    Generate Report
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <h4 className="text-warning">
                    <i className="bi bi-calendar-month"></i> Monthly Analysis
                  </h4>
                  <p className="text-muted">Monthly trends and insights</p>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={generateMonthlyReport}
                  >
                    Generate Report
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <h4 className="text-danger">
                    <i className="bi bi-exclamation-triangle"></i> Critical
                    Alerts
                  </h4>
                  <p className="text-muted">Items requiring attention</p>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={showAlerts}
                  >
                    View Alerts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export & Import */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-download text-primary me-2"></i> Data Export
                & Import Tools
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Import */}
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-upload me-2"></i>Import Data
                  </h6>
                  <p className="text-muted small">
                    Import bulk data from CSV/Excel files
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={importSuppliers}
                    >
                      <i className="bi bi-people me-1"></i>Suppliers
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={importItems}
                    >
                      <i className="bi bi-box me-1"></i>Items
                    </button>
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={importStock}
                    >
                      <i className="bi bi-boxes me-1"></i>Stock
                    </button>
                  </div>
                </div>
                {/* Export */}
                <div className="col-md-6">
                  <h6>
                    <i className="bi bi-download me-2"></i>Export Data
                  </h6>
                  <p className="text-muted small">
                    Export data to various formats
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={exportToCSV}
                    >
                      <i className="bi bi-filetype-csv me-1"></i>CSV
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={exportToExcel}
                    >
                      <i className="bi bi-filetype-xlsx me-1"></i>Excel
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={exportToPDF}
                    >
                      <i className="bi bi-filetype-pdf me-1"></i>PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
