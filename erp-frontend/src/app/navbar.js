"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function Navbar() {
  useEffect(() => {
    // GSAP animation for navbar
    gsap.from("nav", { y: -80, duration: 0.8, ease: "power3.out" });
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" href="/">
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
          <ul className="navbar-nav me-auto">
            {/* Dashboard */}
            <li className="nav-item">
              <Link className="nav-link" href="/dashboard">
                <i className="bi bi-speedometer2"></i> Dashboard
              </Link>
            </li>

            {/* Masters */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-database"></i> Masters
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/suppliers">
                    <i className="bi bi-people"></i> Suppliers
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/items">
                    <i className="bi bi-box"></i> Items
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/warehouses">
                    <i className="bi bi-building"></i> Warehouses
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/locations">
                    <i className="bi bi-geo-alt"></i> Locations
                  </Link>
                </li>
              </ul>
            </li>

            {/* Purchase */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-cart"></i> Purchase
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/purchase-orders">
                    Purchase Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/grn">
                    GRN
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/quality-check">
                    Quality Check
                  </Link>
                </li>
              </ul>
            </li>

            {/* Stock */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-boxes"></i> Stock
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/stock-ledger">
                    Stock Ledger
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/current-stock">
                    Current Stock
                  </Link>
                </li>
              </ul>
            </li>

            {/* Production */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-gear"></i> Production
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/bom">
                    BOM
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/production-orders">
                    Production Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/material-requisition">
                    Material Requisition
                  </Link>
                </li>
              </ul>
            </li>

            {/* Dispatch */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-truck"></i> Dispatch
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" href="/fg-receipt">
                    FG Receipt
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/dispatch">
                    Dispatch
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/invoice">
                    Invoice
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* User Dropdown */}
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle"></i> User
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" href="/profile">
                    <i className="bi bi-person"></i> Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/login">
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" href="/logout">
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
