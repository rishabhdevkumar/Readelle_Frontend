import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { registerUser } from "../../redux/slices/authSlice";
import libraryBg from "../../assets/library.png";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      alert("Please accept Terms & Conditions");
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

      console.log(result);

      if (result?.payload?.data || result?.payload?.success) {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error(err);
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
              <span className="text-white text-xl font-bold">
                ePustakalay
              </span>
            </div>
          </div>

          <div className="px-6 py-5">
            <h1 className="text-center text-2xl font-bold text-[#0a2f35]">
              Join ePustakalay
            </h1>

            <p className="text-center text-slate-400 text-sm mb-5">
              Start your reading journey today
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border border-transparent focus:border-[#0a2f35] outline-none"
                />
              </div>

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border border-transparent focus:border-[#0a2f35] outline-none"
                />
              </div>

              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f4f6fb] border border-transparent focus:border-[#0a2f35] outline-none"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#f4f6fb] border border-transparent focus:border-[#0a2f35] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <label className="flex gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="accent-[#0a2f35]"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#062d33] to-[#0f525b]"
              >
                {loading ? "Creating account..." : "Register →"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#0a2f35]">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}