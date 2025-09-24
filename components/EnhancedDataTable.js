"use client";

import { useState } from "react";

export default function EnhancedDataTable({ tableTitle, tableIcon, tableHeaders, tableData, createUrl, baseUrl }) {
  const [view, setView] = useState("table");
  const [selected, setSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, order: "ASC" });

  // Toggle View
  const toggleView = () => {
    setView(view === "table" ? "card" : "table");
  };

  // Handle Select
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select All
  const toggleSelectAll = () => {
    if (selected.length === tableData.length) {
      setSelected([]);
    } else {
      setSelected(tableData.map((row) => row.id));
    }
  };

  // Sorting
  const handleSort = (key) => {
    let order = "ASC";
    if (sortConfig.key === key && sortConfig.order === "ASC") {
      order = "DESC";
    }
    setSortConfig({ key, order });
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.order === "ASC" ? -1 : 1;
    if (aValue > bValue) return sortConfig.order === "ASC" ? 1 : -1;
    return 0;
  });

  // Export CSV
  const exportTable = () => {
    const headers = tableHeaders.map((h) => h.label).join(",");
    const rows = sortedData.map((row) =>
      tableHeaders.map((h) => row[h.key] ?? "").join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print Table
  const printTable = () => window.print();

  return (
    <div className="card border-0 shadow-sm">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className={`${tableIcon || "bi bi-table"} text-primary me-2`}></i>
          {tableTitle || "Data Table"}{" "}
          <span className="badge bg-primary ms-2">{tableData.length}</span>
        </h5>
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-secondary" onClick={toggleView}>
            <i className={view === "table" ? "bi bi-grid-3x3-gap" : "bi bi-table"}></i>
          </button>
          <button className="btn btn-sm btn-outline-primary" onClick={exportTable}>
            <i className="bi bi-download"></i>
          </button>
          <button className="btn btn-sm btn-outline-success" onClick={printTable}>
            <i className="bi bi-printer"></i>
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {/* Table View */}
        {view === "table" && (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === tableData.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {tableHeaders.map((header) => (
                    <th
                      key={header.key}
                      className="sortable"
                      onClick={() => handleSort(header.key)}
                      style={{ cursor: "pointer" }}
                    >
                      {header.label}
                      <i className="bi bi-arrow-down-up ms-1 text-muted"></i>
                    </th>
                  ))}
                  <th width="150">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length + 2} className="text-center py-5">
                      <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                      <h5 className="text-muted">No Data Available</h5>
                      {createUrl && (
                        <a href={createUrl} className="btn btn-primary">
                          <i className="bi bi-plus-circle me-2"></i>Add New
                        </a>
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggleSelect(row.id)}
                        />
                      </td>
                      {tableHeaders.map((header) => (
                        <td key={header.key}>{row[header.key]}</td>
                      ))}
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a href={`${baseUrl}/${row.id}`} className="btn btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </a>
                          <a href={`${baseUrl}/${row.id}/edit`} className="btn btn-outline-warning">
                            <i className="bi bi-pencil"></i>
                          </a>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => alert(`Delete item ID: ${row.id}`)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Card View */}
        {view === "card" && (
          <div className="row g-3 p-3">
            {sortedData.map((row) => (
              <div className="col-md-6 col-lg-4" key={row.id}>
                <div className="card border">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{row[tableHeaders[0].key]}</h6>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </div>
                    {tableHeaders.slice(1, 3).map((header) => (
                      <p className="card-text small mb-1" key={header.key}>
                        <strong>{header.label}: </strong>
                        {row[header.key]}
                      </p>
                    ))}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="btn-group btn-group-sm">
                        <a href={`${baseUrl}/${row.id}`} className="btn btn-outline-primary">
                          <i className="bi bi-eye"></i>
                        </a>
                        <a href={`${baseUrl}/${row.id}/edit`} className="btn btn-outline-warning">
                          <i className="bi bi-pencil"></i>
                        </a>
                      </div>
                      {row.status && <span className="badge bg-secondary">{row.status}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
