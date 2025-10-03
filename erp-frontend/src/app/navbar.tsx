"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useUserStore } from "../store/user";
 // ✅ zustand store import

export default function Navbar() {
  const { isAuth, user, logout } = useUserStore();

  useEffect(() => {
    // GSAP animation for navbar
    gsap.from("nav", { y: -80, duration: 0.8, ease: "power3.out" });
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" href="/dashboard">
          <i className="bi bi-gear-fill me-2"></i>
          My ERP System
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* ✅ ERP Menus only if logged in */}
          {isAuth && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" href="/dashboard">
                  <i className="bi bi-speedometer2"></i> Dashboard
                </Link>
              </li>
              {/* Masters */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-database"></i> Masters
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" href="/suppliers"><i className="bi bi-people"></i> Suppliers</Link></li>
                  <li><Link className="dropdown-item" href="/items"><i className="bi bi-box"></i> Items</Link></li>
                  <li><Link className="dropdown-item" href="/warehouses"><i className="bi bi-building"></i> Warehouses</Link></li>
                  <li><Link className="dropdown-item" href="/locations"><i className="bi bi-geo-alt"></i> Locations</Link></li>
                </ul>
              </li>
              {/* Purchase */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-cart"></i> Purchase
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" href="/purchase-orders">Purchase Orders</Link></li>
                  <li><Link className="dropdown-item" href="/grn">GRN</Link></li>
                  <li><Link className="dropdown-item" href="/quality-check">Quality Check</Link></li>
                </ul>
              </li>
              {/* Stock */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-boxes"></i> Stock
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" href="/stock-ledger">Stock Ledger</Link></li>
                  <li><Link className="dropdown-item" href="/current-stock">Current Stock</Link></li>
                </ul>
              </li>
              {/* Production */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-gear"></i> Production
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" href="/bom">BOM</Link></li>
                  <li><Link className="dropdown-item" href="/production-orders">Production Orders</Link></li>
                  <li><Link className="dropdown-item" href="/material-requisition">Material Requisition</Link></li>
                </ul>
              </li>
              {/* Dispatch */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-truck"></i> Dispatch
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" href="/fg-receipt">FG Receipt</Link></li>
                  <li><Link className="dropdown-item" href="/dispatch">Dispatch</Link></li>
                  <li><Link className="dropdown-item" href="/invoice">Invoice</Link></li>
                </ul>
              </li>
            </ul>
          )}

          {/* ✅ User Section */}
          <ul className="navbar-nav ms-auto">
            {isAuth ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle"></i> {user?.username || "User"}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" href="/profile">
                      <i className="bi bi-person"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={logout}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/">
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/register">
                    <i className="bi bi-person-plus"></i> Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
