
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, logout } from "../../redux/slices/authSlice"; 
import toast from "react-hot-toast";

const ROLE_ROUTES = {
  admin: "/admin",
  user: "/",
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Input change handler - empty validation alert strings dynamically
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    // Type karte hi client-side validations ko UI element layer se hatana
    setErrors((prevErr) => {
      if (prevErr[field]) {
        return { ...prevErr, [field]: "" };
      }
      return prevErr;
    });
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (loading) return;

    // Reset standard form state keys 
    setErrors({ email: "", password: "" });

    // Client-side empty structure validation logic
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));

      if (loginUser.fulfilled.match(result)) {
        const payload = result.payload || {};
        const userData = payload?.user || payload?.data?.user || payload?.data || payload;

        // Account lifecycle block evaluation
        if (userData?.status && userData.status !== "Active") {
          toast.error("Your account is deactivated or suspended. Please contact the administrator.");
          dispatch(logout());
          setLoading(false);
          return;
        }

        const role = userData?.role || "user";
        const destination = ROLE_ROUTES[role] ?? "/";

        toast.success(payload?.message || "Login successful!", { 
          duration: 2500, 
          position: 'top-center' 
        });

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 900);

      } else if (loginUser.rejected.match(result)) {
        // Safe fallback for backend string response parsing
        const errorMessage = typeof result.payload === 'string' 
          ? result.payload 
          : "Invalid credentials. Please try again.";

        // 🚀 TOAST TRIGGER ONLY: Ab login filter crashes sirf notification toast banner pe hi pop up honge
        toast.error(errorMessage, { duration: 4000, position: "top-center" });
      }
    } catch (err) {
      console.error("Login component caught a crash error: ", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 relative overflow-hidden font-sans">
      {/* Background Decorators */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-teal-200 opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-teal-300 opacity-20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full px-4">
        {/* Core Header Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-900 flex items-center justify-center shadow-lg mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-teal-900 font-semibold text-lg tracking-wide">ePustakalay</span>
        </div>

        {/* Card Component Form Container */}
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm px-8 py-8">
          <h1 className="text-center text-2xl md:text-3xl font-bold text-[#0a2f35] mb-1">
            Welcome Back
          </h1>
          <p className="text-center text-slate-400 text-sm mb-6">
            Sign in to continue to ePustakalay
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            
            {/* Email Form Field Section */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  required
                  autoComplete="email"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-500'} bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition`}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-[11px] font-medium leading-none mt-1">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Form Field Section */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleInputChange('password')}
                  required
                  autoComplete="current-password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-teal-500'} bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-[11px] font-medium leading-none mt-1">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Submit Trigger Elements Layer */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-900 hover:bg-teal-800 active:scale-[0.98] text-white text-sm font-semibold tracking-wide shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-teal-800 font-semibold hover:text-teal-600 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}