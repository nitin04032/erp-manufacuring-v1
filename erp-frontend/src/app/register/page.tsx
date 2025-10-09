"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// Animation Variants for Framer Motion
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFlash({ type: "", message: "" }); // Clear previous messages

    if (form.password !== form.confirm) {
      setFlash({ type: "danger", message: "Passwords do not match." });
      return;
    }
    if (form.password.length < 6) {
      setFlash({ type: "danger", message: "Password must be at least 6 characters." });
      return;
    }
    if (!form.terms) {
      setFlash({ type: "danger", message: "You must agree to the terms." });
      return;
    }
    
    setLoading(true);

    try {
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

      const data = await res.json();
      if (res.ok) {
        setFlash({ type: "success", message: "Account created successfully!" });
        setForm({ name: "", email: "", password: "", confirm: "", role: "user", terms: false });
      } else {
        setFlash({ type: "danger", message: data.message || "Registration failed." });
      }
    } catch (error) {
      setFlash({ type: "danger", message: "Server error. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    setForm(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="container" style={{ paddingTop: '5vh', paddingBottom: '5vh' }}>
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <motion.div
            className="card shadow-lg border-0 rounded-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="card-body p-5">
              <motion.div variants={itemVariants} className="text-center mb-4">
                <i className="bi bi-person-plus-fill display-1 text-success mb-3"></i>
                <h3 className="card-title fw-bold">Create Account</h3>
                <p className="text-muted">Join Manufacturing ERP System</p>
              </motion.div>

              {flash.message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className={`alert alert-${flash.type} alert-dismissible fade show`}>
                    {flash.message}
                    <button type="button" className="btn-close" onClick={() => setFlash({ type: "", message: "" })}></button>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <motion.div variants={itemVariants} className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person"></i></span>
                      <input type="text" id="name" className="form-control" placeholder="Enter full name" required value={form.name} onChange={handleChange} />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input type="email" id="email" className="form-control" placeholder="Enter email address" required value={form.email} onChange={handleChange} />
                    </div>
                  </motion.div>
                </div>
                <div className="row">
                  <motion.div variants={itemVariants} className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input type={show.password ? "text" : "password"} id="password" className="form-control" placeholder="Enter password" required minLength={6} value={form.password} onChange={handleChange} />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShow({ ...show, password: !show.password })}>
                        <i className={`bi ${show.password ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="col-md-6 mb-3">
                    <label htmlFor="confirm" className="form-label">Confirm Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                      <input type={show.confirm ? "text" : "password"} id="confirm" className="form-control" placeholder="Re-enter password" required value={form.confirm} onChange={handleChange} />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShow({ ...show, confirm: !show.confirm })}>
                        <i className={`bi ${show.confirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </motion.div>
                </div>
                <motion.div variants={itemVariants} className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select id="role" className="form-select" value={form.role} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </motion.div>
                <motion.div variants={itemVariants} className="mb-4 form-check">
                  <input type="checkbox" id="terms" className="form-check-input" checked={form.terms} onChange={handleChange} />
                  <label className="form-check-label small" htmlFor="terms">
                    I agree to the <Link href="/terms" className="text-decoration-none">Terms of Service</Link> and <Link href="/privacy" className="text-decoration-none">Privacy Policy</Link> *
                  </label>
                </motion.div>
                <motion.div variants={itemVariants} className="d-grid" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-check me-2"></i>Create Account
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
              <motion.div variants={itemVariants}>
                <hr className="my-4" />
                <div className="text-center">
                  <p className="text-muted">Already have an account?</p>
                  <Link href="/" className="btn btn-outline-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}