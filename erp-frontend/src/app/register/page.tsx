"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "user",
    terms: false,
  });

  const [show, setShow] = useState({
    password: false,
    confirm: false,
  });

  const [flash, setFlash] = useState({ type: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setFlash({ type: "danger", message: "Passwords do not match." });
      return;
    }
    if (!form.terms) {
      setFlash({ type: "danger", message: "You must agree to the terms." });
      return;
    }

    try {
      console.log("Register API:", process.env.NEXT_PUBLIC_API_URL);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify({
            username: form.name,
            email: form.email,
            password: form.password,
            full_name: form.name,
            role: form.role,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        setFlash({ type: "success", message: "Account created successfully!" });
        setForm({
          name: "",
          email: "",
          password: "",
          confirm: "",
          role: "user",
          terms: false,
        });
      } else {
        const data = await res.json();
        setFlash({
          type: "danger",
          message: data.error || "Registration failed.",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      setFlash({ type: "danger", message: "Server error. Try again later." });
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 mt-5 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus-fill display-1 text-success mb-3"></i>
                <h3 className="card-title fw-bold">Create Account</h3>
                <p className="text-muted">Join Manufacturing ERP System</p>
              </div>

              {flash.message && (
                <div
                  className={`alert alert-${flash.type} alert-dismissible fade show`}
                >
                  {flash.message}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setFlash({ type: "", message: "" })}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Form Fields... (No changes here) */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person"></i></span>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Enter full name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Enter email address"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input
                        type={show.password ? "text" : "password"}
                        id="password"
                        className="form-control"
                        placeholder="Enter password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShow({ ...show, password: !show.password })}>
                        <i className={`bi ${show.password ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirm" className="form-label">Confirm Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                      <input
                        type={show.confirm ? "text" : "password"}
                        id="confirm"
                        className="form-control"
                        placeholder="Re-enter password"
                        required
                        value={form.confirm}
                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShow({ ...show, confirm: !show.confirm })}>
                        <i className={`bi ${show.confirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    id="role"
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Terms (CHANGED to use Link component) */}
                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    id="terms"
                    className="form-check-input"
                    checked={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  />
                  <label className="form-check-label small" htmlFor="terms">
                    I agree to the <Link href="/terms" className="text-decoration-none">Terms of Service</Link> and <Link href="/privacy" className="text-decoration-none">Privacy Policy</Link> *
                  </label>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success btn-lg">
                    <i className="bi bi-person-check me-2"></i>Create Account
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted">Already have an account?</p>
                <Link href="/" className="btn btn-outline-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}