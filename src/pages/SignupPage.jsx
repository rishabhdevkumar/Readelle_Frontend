import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { registerUser } from "../redux/slices/authSlice";
import "./auth.css";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      // react-hot-toast is available via store
      const toast = (await import("react-hot-toast")).default;
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        registerUser({ email: form.email, password: form.password })
      );

      // If registration succeeded, go to login
      if (result?.payload?.data) {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-bg" />

      <div className="signup-wrapper">
        <div className="signup-card">
          {/* Top banner */}
          <div className="signup-banner">
            <div className="signup-banner-overlay" />
            <div className="signup-banner-content">
              <div className="signup-banner-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="signup-banner-text">ePustakalay</span>
            </div>
          </div>

          {/* Form area */}
          <div className="signup-body">
            <h1 className="signup-title">Join ePustakalay</h1>
            <p className="signup-subtitle">Start your reading journey today</p>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Email */}
              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-email">Email Address</label>
                <div className="signup-input-wrap">
                  <Mail size={15} className="signup-input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="signup-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-password">Password</label>
                <div className="signup-input-wrap">
                  <Lock size={15} className="signup-input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="signup-input"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="signup-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-confirm">Confirm Password</label>
                <div className="signup-input-wrap">
                  <Lock size={15} className="signup-input-icon" />
                  <input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="signup-input"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="signup-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle confirm password"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="signup-checkbox-label">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="signup-checkbox"
                  required
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="signup-link-accent">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="signup-link-accent">Privacy Policy</Link>
                </span>
              </label>

              <button
                id="signup-submit"
                type="submit"
                className="signup-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="login-btn-spinner">
                    <span className="login-spinner" /> Creating account...
                  </span>
                ) : (
                  "Register →"
                )}
              </button>
            </form>

            <p className="signup-login-link">
              Already have an account?{" "}
              <Link to="/login" className="signup-link-accent">Login</Link>
            </p>

            {/* Divider */}
            <div className="signup-divider">
              <span className="signup-divider-line" />
              <span className="signup-divider-text">OR CONTINUE WITH</span>
              <span className="signup-divider-line" />
            </div>

            {/* Social */}
            <div className="signup-social-row">
              <button id="signup-google" className="signup-social-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google
              </button>
              <button id="signup-linkedin" className="signup-social-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>

            {/* Footer */}
            <div className="signup-footer">
              <a href="#" className="signup-footer-link">Need Help?</a>
              <span className="signup-footer-sep">·</span>
              <a href="#" className="signup-footer-link">Language: English (US)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
