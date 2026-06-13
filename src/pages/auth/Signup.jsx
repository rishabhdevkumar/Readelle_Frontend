
import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { registerUser } from "../../redux/slices/authSlice";
import libraryBg from "../../assets/library.png";
import logo from "../../assets/ePustakalayNewLogo.png";
import toast from "react-hot-toast";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleInputChange = useCallback((field) => (e) => {
    let value = e.target.value;

    if (field === "phone") {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [field]: value }));

    setErrors((prevErr) => {
      if (prevErr[field]) {
        return { ...prevErr, [field]: "" };
      }
      return prevErr;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrors({ name: "", email: "", phone: "", password: "" });

    const newErrors = { name: "", email: "", phone: "", password: "" };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Full Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (form.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
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

    if (!agreed) {
      toast.error("Please accept the Terms & Conditions", { position: "top-center" });
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        registerUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        })
      );

      if (result?.payload?.data || result?.payload?.success) {
        navigate("/login", { replace: true });
      } else {
        const errorMsg = typeof result.payload === "string"
          ? result.payload
          : "Registration failed. Please try again.";
        toast.error(errorMsg, { position: "top-center" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef2f7] px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">

          <div className="relative h-[120px] overflow-hidden">
            <img
              src={libraryBg}
              alt="Library"
              className="absolute inset-0 w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

            <div className="relative h-full flex items-center justify-center gap-2">
              <img 
                src={logo} 
                alt="ePustakalay Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          <div className="px-6 py-5">
            <h1 className="text-center text-2xl font-bold text-[#0a2f35]">
              Join ePustakalay
            </h1>

            <p className="text-center text-slate-400 text-sm mb-5">
              Start your reading journey today
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleInputChange("name")}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-[#0a2f35]'} outline-none transition`}
                  />
                </div>
                {errors.name && (
                  <span className="text-red-500 text-[11px] font-medium pl-1">{errors.name}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-[#0a2f35]'} outline-none transition`}
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-[11px] font-medium pl-1">{errors.email}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    maxLength={10}
                    onChange={handleInputChange("phone")}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-[#0a2f35]'} outline-none transition`}
                  />
                </div>
                {errors.phone && (
                  <span className="text-red-500 text-[11px] font-medium pl-1">{errors.phone}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min 6 characters)"
                    value={form.password}
                    onChange={handleInputChange("password")}
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#f4f6fb] border ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-[#0a2f35]'} outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-[11px] font-medium pl-1">{errors.password}</span>
                )}
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-500 select-none pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-[#0a2f35] mt-0.5"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#062d33] to-[#0f525b] hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register →"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#0a2f35] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}