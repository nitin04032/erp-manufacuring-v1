"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    suppliers: 12,
    items: 150,
    warehouses: 4,
    purchase_orders: 28,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      title: "New Purchase Order Created",
      description: "Order #PO-102 created successfully.",
      date: "2025-09-18 10:30",
      status: "pending",
    },
    {
      title: "Supplier Added",
      description: "ABC Suppliers Pvt Ltd added.",
      date: "2025-09-17 14:20",
      status: "approved",
    },
  ]);

  const [statusCounts, setStatusCounts] = useState({
    pending: 5,
    approved: 10,
    ordered: 8,
    received: 3,
    cancelled: 2,
  });

  const statusColors = {
    pending: "warning",
    approved: "primary",
    ordered: "info",
    received: "success",
    cancelled: "danger",
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container-fluid">
      {/* Enhanced Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-0">
              <i className="bi bi-speedometer2 text-primary"></i> Manufacturing
              ERP Dashboard
            </h1>
            <p className="text-muted mb-0">
              Welcome back! Here's what's happening in your manufacturing
              operations.
            </p>
          </div>
          <div className="text-end">
            <span className="badge bg-success fs-6">System Online</span>
            <br />
            <small className="text-muted">
              {new Date().toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="row mb-4">
        <DashboardCard
          icon="bi-people-fill"
          color="primary"
          title="Active Suppliers"
          value={stats.suppliers}
          link="/suppliers"
        />
        <DashboardCard
          icon="bi-box-seam"
          color="success"
          title="Items Catalog"
          value={stats.items}
          link="/items"
        />
        <DashboardCard
          icon="bi-building"
          color="warning"
          title="Warehouses"
          value={stats.warehouses}
          link="/warehouses"
        />
        <DashboardCard
          icon="bi-cart-check"
          color="info"
          title="Purchase Orders"
          value={stats.purchase_orders}
          link="/purchase-orders"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activities + Status Overview */}
      <div className="row">
        {/* Recent Activities */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history text-primary me-2"></i>
                Recent Activities
              </h5>
            </div>
            <div className="card-body">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
                  <h6 className="text-muted">No Recent Activities</h6>
                  <p className="text-muted small">
                    Start by creating your first purchase order or adding
                    suppliers.
                  </p>
                </div>
              ) : (
                <>
                  <div className="timeline">
                    {recentActivities.map((activity, index) => (
                      <div className="timeline-item mb-3" key={index}>
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div className="bg-primary rounded-circle p-2">
                              <i className="bi bi-cart text-white"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">{activity.title}</h6>
                            <p className="text-muted mb-1">
                              {activity.description}
                            </p>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {activity.date}
                              <span
                                className={`badge bg-${
                                  statusColors[activity.status] || "secondary"
                                } ms-2`}
                              >
                                {activity.status}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Link href="/purchase-orders" className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-arrow-right me-1"></i>View All
                      Activities
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart text-success me-2"></i>
                Order Status Overview
              </h5>
            </div>
            <div className="card-body">
              {total === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-graph-down fs-1 text-muted mb-3"></i>
                  <h6 className="text-muted">No Data Available</h6>
                  <p className="text-muted small">
                    Create purchase orders to see status distribution.
                  </p>
                </div>
              ) : (
                Object.entries(statusCounts).map(([status, count], index) => (
                  <div className="mb-3" key={index}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-capitalize">{status}</span>
                      <span
                        className={`badge bg-${
                          statusColors[status] || "secondary"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className={`progress-bar bg-${
                          statusColors[status] || "secondary"
                        }`}
                        style={{
                          width: `${total > 0 ? (count / total) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle text-info me-2"></i>
                System Information
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="row">
                <div className="col-6 border-end">
                  <h6 className="text-success">
                    <i className="bi bi-check-circle me-1"></i> Database
                  </h6>
                  <small className="text-muted">Connected</small>
                </div>
                <div className="col-6">
                  <h6 className="text-success">
                    <i className="bi bi-server me-1"></i> Server
                  </h6>
                  <small className="text-muted">Online</small>
                </div>
              </div>
              <hr />
              <small className="text-muted">
                Manufacturing ERP v1.0 <br />
                Last updated: {new Date().toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Card Component */
function DashboardCard({ icon, color, title, value, link }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="mb-3">
            <i className={`bi ${icon} display-4 text-${color}`}></i>
          </div>
          <h3 className="card-title">{value.toLocaleString()}</h3>
          <p className="card-text text-muted">{title}</p>
          <Link href={link} className={`btn btn-outline-${color} btn-sm`}>
            <i className="bi bi-arrow-right me-1"></i>View All
          </Link>
        </div>
      </div>
    </div>
  );
}

/* Quick Actions Component */
function QuickActions() {
  const actions = [
    {
      icon: "bi-plus-circle-fill",
      label: "New Purchase Order",
      color: "primary",
      link: "/purchase-orders/create",
    },
    {
      icon: "bi-person-plus-fill",
      label: "Add Supplier",
      color: "success",
      link: "/suppliers/create",
    },
    {
      icon: "bi-box-seam-fill",
      label: "Add Item",
      color: "warning",
      link: "/items/create",
    },
    {
      icon: "bi-clipboard-check-fill",
      label: "Goods Receipt",
      color: "info",
      link: "/grn",
    },
    {
      icon: "bi-graph-up",
      label: "Stock Report",
      color: "secondary",
      link: "/stock-ledger",
    },
    {
      icon: "bi-gear-fill",
      label: "Production",
      color: "dark",
      link: "/production-orders",
    },
  ];

  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-lightning-charge text-warning me-2"></i> Quick
              Actions
            </h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              {actions.map((action, index) => (
                <div className="col-md-2 mb-3" key={index}>
                  <Link
                    href={action.link}
                    className={`btn btn-outline-${action.color} d-block`}
                  >
                    <i className={`bi ${action.icon} fs-1 mb-2`}></i>
                    <br />
                    {action.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
