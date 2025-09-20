"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flash, setFlash] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setFlash({ type: "danger", message: "Please enter email and password." });
      return;
    }

    try {
      // Example API call (replace with Supabase or your API route)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setFlash({ type: "success", message: "Login successful!" });
        // redirect dashboard
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setFlash({ type: "danger", message: data.message || "Login failed." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Try again later." });
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light bg-gradient">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <i className="bi bi-gear-fill display-1 text-primary mb-3"></i>
              <h3 className="card-title fw-bold">Manufacturing ERP</h3>
              <p className="text-muted">Sign in to continue</p>
            </div>

            {/* Flash Messages */}
            {flash.message && (
              <div
                className={`alert alert-${flash.type} alert-dismissible fade show`}
                role="alert"
              >
                {flash.type === "danger" && (
                  <i className="bi bi-exclamation-triangle me-2"></i>
                )}
                {flash.type === "success" && (
                  <i className="bi bi-check-circle me-2"></i>
                )}
                {flash.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setFlash({ type: "", message: "" })}
                ></button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="form-control"
                    placeholder="Enter password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <div>
                    <input
                      type="checkbox"
                      id="remember"
                      className="form-check-input"
                    />
                    <label className="form-check-label small" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="small text-decoration-none"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                </button>
              </div>
            </form>

            <hr className="my-4" />

            {/* Create Account */}
            <div className="text-center">
              <p className="text-muted mb-2">Don't have an account?</p>
              <Link href="/register" className="btn btn-outline-primary">
                <i className="bi bi-person-plus me-2"></i>Create Account
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-light border rounded-3">
              <h6 className="text-muted mb-2">Demo Credentials:</h6>
              <small className="text-muted">
                <strong>Email:</strong> admin@erp.com
                <br />
                <strong>Password:</strong> admin123
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
