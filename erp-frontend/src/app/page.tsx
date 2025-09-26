'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '../store/user'; // Adjust the import path to your Zustand store

export default function LoginPage() {
  // --- STATE MANAGEMENT ---
  // Local state for form inputs and UI notifications
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);

  // --- HOOKS ---
  // Next.js router for client-side navigation
  const router = useRouter();
  // Global state and actions from Zustand store
  const { setToken, isAuth } = useUserStore();

  // --- SIDE EFFECTS ---
  // Effect to redirect if the user is already authenticated
  useEffect(() => {
    if (isAuth) {
      router.push('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [isAuth, router]);

  // --- HANDLERS ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNotification({ type: '', message: '' }); // Reset notification on new submission

    // Basic validation
    if (!email || !password) {
      setNotification({ type: 'danger', message: 'Please enter both email and password.' });
      return;
    }

    try {
      // Fetch data from the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Backend expects {email, password}
      });

      const data = await response.json();

      if (!response.ok) {
        // Use error message from API or a default one
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      // On successful login, update global state and redirect
      if (data.access_token) {
        setToken(data.access_token); // Save token to Zustand store
        router.push('/dashboard'); // Redirect to the user dashboard
      } else {
        throw new Error('Token not found in the server response.');
      }

    } catch (err: any) {
      // Display any errors to the user
      setNotification({ type: 'danger', message: err.message });
    }
  };

  // --- RENDER ---
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

            {/* Notification Alert */}
            {notification.message && (
              <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
                {notification.message}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNotification({ type: '', message: '' })}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-envelope"></i></span>
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

              {/* Password Input */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock"></i></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                </button>
              </div>
            </form>

            <hr className="my-4" />

            {/* Link to Register Page */}
            <div className="text-center">
              <p className="text-muted mb-2">Don't have an account?</p>
              <Link href="/register" className="btn btn-outline-primary">
                <i className="bi bi-person-plus me-2"></i>Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}