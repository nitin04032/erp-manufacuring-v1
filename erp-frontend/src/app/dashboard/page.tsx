// FINAL COMBINED CODE (erp-frontend/src/app/dashboard/page.tsx)

'use client';

import { useApi } from '../../hooks/useApi'; // Apna custom hook import karein
import Link from 'next/link';

// API se aane waale data ka structure (example)
interface DashboardStats {
  suppliers: number;
  items: number;
  warehouses: number;
  purchase_orders: number;
}

interface RecentActivity {
  title: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
}

interface StatusCounts {
  pending: number;
  approved: number;
  ordered: number;
  received: number;
  cancelled: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  statusCounts: StatusCounts;
}

export default function DashboardPage() {
  // Step 1: useApi hook se live data fetch karein
  const { data, loading, error } = useApi<DashboardData>('/dashboard/summary');

  // Step 2: Loading state handle karein
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Step 3: Error state handle karein
  if (error) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          <strong>Error:</strong> Failed to load dashboard data. {error}
        </div>
      </div>
    );
  }

  // Step 4: API se aaye data ya default values ka istemaal karein
  const stats = data?.stats || { suppliers: 0, items: 0, warehouses: 0, purchase_orders: 0 };
  const recentActivities = data?.recentActivities || [];
  const statusCounts = data?.statusCounts || { pending: 0, approved: 0, ordered: 0, received: 0, cancelled: 0 };
  
  const statusColors: { [key: string]: string } = {
    pending: "warning",
    approved: "primary",
    ordered: "info",
    received: "success",
    cancelled: "danger",
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Yahan se aapka poora Bootstrap wala rich UI code shuru hota hai
  return (
    <div className="container-fluid">
      {/* Enhanced Dashboard Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-0">
              <i className="bi bi-speedometer2 text-primary"></i> Manufacturing ERP Dashboard
            </h1>
            <p className="text-muted mb-0">
              Welcome back! Here's what's happening in your manufacturing operations.
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
        <DashboardCard icon="bi-people-fill" color="primary" title="Active Suppliers" value={stats.suppliers} link="/suppliers" />
        <DashboardCard icon="bi-box-seam" color="success" title="Items Catalog" value={stats.items} link="/items" />
        <DashboardCard icon="bi-building" color="warning" title="Warehouses" value={stats.warehouses} link="/warehouses" />
        <DashboardCard icon="bi-cart-check" color="info" title="Purchase Orders" value={stats.purchase_orders} link="/purchase-orders" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activities + Status Overview */}
      <div className="row">
        {/* Recent Activities */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header"><h5 className="mb-0"><i className="bi bi-clock-history text-primary me-2"></i>Recent Activities</h5></div>
            <div className="card-body">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4"><i className="bi bi-calendar-x fs-1 text-muted mb-3"></i><h6 className="text-muted">No Recent Activities</h6></div>
              ) : (
                <div className="timeline">
                  {recentActivities.map((activity, index) => (
                    <div className="timeline-item mb-3" key={index}>
                      <div className="d-flex">
                        <div className="flex-shrink-0"><div className="bg-primary rounded-circle p-2"><i className="bi bi-cart text-white"></i></div></div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1">{activity.title}</h6>
                          <p className="text-muted mb-1">{activity.description}</p>
                          <small className="text-muted"><i className="bi bi-clock me-1"></i>{activity.date}
                            <span className={`badge bg-${statusColors[activity.status] || "secondary"} ms-2`}>{activity.status}</span>
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header"><h5 className="mb-0"><i className="bi bi-pie-chart text-success me-2"></i>Order Status Overview</h5></div>
            <div className="card-body">
              {total === 0 ? (
                <div className="text-center py-4"><i className="bi bi-graph-down fs-1 text-muted mb-3"></i><h6 className="text-muted">No Data Available</h6></div>
              ) : (
                Object.entries(statusCounts).map(([status, count]) => (
                  <div className="mb-3" key={status}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-capitalize">{status}</span>
                      <span className={`badge bg-${statusColors[status] || "secondary"}`}>{count}</span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div className={`progress-bar bg-${statusColors[status] || "secondary"}`} style={{ width: `${(count / total) * 100}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components (isi file mein rakhe gaye hain)

function DashboardCard({ icon, color, title, value, link }: { icon: string; color: string; title: string; value: number; link: string; }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className="mb-3"><i className={`bi ${icon} display-4 text-${color}`}></i></div>
          <h3 className="card-title">{value.toLocaleString()}</h3>
          <p className="card-text text-muted">{title}</p>
          <Link href={link} className={`btn btn-outline-${color} btn-sm`}><i className="bi bi-arrow-right me-1"></i>View Details</Link>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: "bi-plus-circle-fill", label: "New PO", color: "primary", link: "/purchase-orders/create" },
    { icon: "bi-person-plus-fill", label: "Add Supplier", color: "success", link: "/suppliers/create" },
    { icon: "bi-box-seam-fill", label: "Add Item", color: "warning", link: "/items/create" },
    { icon: "bi-clipboard-check-fill", label: "Goods Receipt", color: "info", link: "/grn" },
  ];
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light"><h5 className="mb-0"><i className="bi bi-lightning-charge text-warning me-2"></i>Quick Actions</h5></div>
          <div className="card-body">
            <div className="row text-center">
              {actions.map((action) => (
                <div className="col mb-2" key={action.label}>
                  <Link href={action.link} className={`btn btn-outline-${action.color} d-block`}>
                    <i className={`bi ${action.icon} fs-1 mb-2`}></i><br />{action.label}
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