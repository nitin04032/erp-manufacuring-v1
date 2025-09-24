"use client";

import Link from "next/link";

export default function BulkOperations() {
  // Quick Action Handlers
  const generateSampleData = async () => {
    if (confirm("Generate sample test data?")) {
      try {
        const res = await fetch("/api/bulk-operations/generate-sample", {
          method: "POST",
        });
        const data = await res.json();
        alert(data.message || "Sample data generated ✅");
      } catch {
        alert("Error generating sample data ❌");
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "supplier_name,supplier_code,contact_person,email,phone,address,city,state,status\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "supplier_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const validateData = () => {
    alert("Validation tool will scan for inconsistencies ✅");
  };

  const backupData = async () => {
    if (confirm("Create a full database backup?")) {
      try {
        const res = await fetch("/api/bulk-operations/backup", {
          method: "POST",
        });
        const data = await res.json();
        alert(data.message || "Backup completed ✅");
      } catch {
        alert("Backup failed ❌");
      }
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">
            <i className="bi bi-layers text-primary"></i> Bulk Operations
          </h1>
          <Link href="/" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Operations Grid */}
      <div className="row">
        {/* Data Export */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary rounded-circle p-3 me-3">
                  <i className="bi bi-download text-white fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Data Export</h5>
                  <p className="text-muted small mb-0">
                    Export data to CSV or JSON format
                  </p>
                </div>
              </div>

              <form method="POST" action="/api/bulk-operations/export">
                <div className="mb-3">
                  <label className="form-label">Select Table to Export</label>
                  <select name="table" className="form-select" required>
                    <option value="">Choose a table...</option>
                    <option value="suppliers">Suppliers</option>
                    <option value="items">Items</option>
                    <option value="warehouses">Warehouses</option>
                    <option value="purchase_orders">Purchase Orders</option>
                    <option value="grns">GRN Records</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Export Format</label>
                  <select name="format" className="form-select">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-download me-2"></i>Export Data
                </button>
              </form>

              <div className="alert alert-info mt-3">
                <small>
                  <i className="bi bi-info-circle me-1"></i>
                  Exported data can be used for backup, analysis, or migration.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Data Import */}
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success rounded-circle p-3 me-3">
                  <i className="bi bi-upload text-white fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Data Import</h5>
                  <p className="text-muted small mb-0">
                    Import data from CSV files
                  </p>
                </div>
              </div>
              <p className="card-text">
                Bulk import data from CSV files to quickly populate your
                database.
              </p>
              <Link href="/bulk-operations/import" className="btn btn-success">
                <i className="bi bi-upload me-2"></i>Import Data
              </Link>
              <div className="alert alert-warning mt-3">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Ensure your CSV matches the required format before importing.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightning text-warning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={generateSampleData}
                  >
                    <i className="bi bi-file-earmark-plus mb-2 fs-4"></i>
                    <br />
                    Generate Sample Data
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={downloadTemplate}
                  >
                    <i className="bi bi-file-earmark-arrow-down mb-2 fs-4"></i>
                    <br />
                    Download CSV Template
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-warning w-100"
                    onClick={validateData}
                  >
                    <i className="bi bi-shield-check mb-2 fs-4"></i>
                    <br />
                    Validate Data
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={backupData}
                  >
                    <i className="bi bi-archive mb-2 fs-4"></i>
                    <br />
                    Full Database Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
