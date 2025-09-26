"use client";

import { useState } from "react";

export default function AdvancedSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    global_search: "",
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    status: "",
    sort_by: "created_at",
    sort_order: "DESC",
    per_page: "10",
    quick_filter: "",
  });

  // Handle Change
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  // Reset Filters
  const handleReset = () => {
    setFilters({
      global_search: "",
      date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      date_to: new Date().toISOString().split("T")[0],
      status: "",
      sort_by: "created_at",
      sort_order: "DESC",
      per_page: "10",
      quick_filter: "",
    });
    onSearch({});
  };

  // Quick Filters (Today / Week / Month)
  const applyQuickFilter = (type) => {
    const today = new Date();
    let fromDate = filters.date_from;
    let toDate = filters.date_to;

    switch (type) {
      case "today":
        fromDate = toDate = today.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        fromDate = weekStart.toISOString().split("T")[0];
        toDate = new Date().toISOString().split("T")[0];
        break;
      case "month":
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        fromDate = monthStart.toISOString().split("T")[0];
        toDate = new Date().toISOString().split("T")[0];
        break;
    }

    setFilters({ ...filters, date_from: fromDate, date_to: toDate, quick_filter: type });
    onSearch({ ...filters, date_from: fromDate, date_to: toDate, quick_filter: type });
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-search text-primary me-2"></i> Advanced Search & Filters
        </h6>
        <button
          className="btn btn-sm btn-outline-secondary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#advancedSearch"
        >
          <i className="bi bi-funnel"></i> Toggle Filters
        </button>
      </div>

      <div className="collapse" id="advancedSearch">
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            {/* Global Search */}
            <div className="col-md-4">
              <label className="form-label">Global Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  name="global_search"
                  className="form-control"
                  placeholder="Search anything..."
                  value={filters.global_search}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="col-md-2">
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="date_from"
                className="form-control"
                value={filters.date_from}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="date_to"
                className="form-control"
                value={filters.date_to}
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-1"></i>Search
                </button>
              </div>
            </div>

            {/* Extra Filters */}
            <div className="col-12">
              <hr />
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Sort By</label>
                  <select
                    name="sort_by"
                    className="form-select"
                    value={filters.sort_by}
                    onChange={handleChange}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="name">Name</option>
                    <option value="status">Status</option>
                    <option value="amount">Amount</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Order</label>
                  <select
                    name="sort_order"
                    className="form-select"
                    value={filters.sort_order}
                    onChange={handleChange}
                  >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Results Per Page</label>
                  <select
                    name="per_page"
                    className="form-select"
                    value={filters.per_page}
                    onChange={handleChange}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div className="col-md-3">
                  <label className="form-label">Quick Filters</label>
                  <div className="btn-group d-grid" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="quick_filter"
                      id="today"
                      checked={filters.quick_filter === "today"}
                      onChange={() => applyQuickFilter("today")}
                    />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="today">
                      Today
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="quick_filter"
                      id="week"
                      checked={filters.quick_filter === "week"}
                      onChange={() => applyQuickFilter("week")}
                    />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="week">
                      This Week
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="quick_filter"
                      id="month"
                      checked={filters.quick_filter === "month"}
                      onChange={() => applyQuickFilter("month")}
                    />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="month">
                      This Month
                    </label>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleReset}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
