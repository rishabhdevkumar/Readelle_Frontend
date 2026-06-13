import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../redux/slices/authSlice";
import {
  User, Mail, Phone, Shield, Clock, BarChart3,
  Settings, Edit, Lock, Bell, LogIn
} from "lucide-react";

function InitialsAvatar({ name, size = 96 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white"
      style={{
        background: "linear-gradient(135deg, #002629, #38656a)",
      }}
    >
      {initials}
    </div>
  );
}

export default function MyAccount() {
  const dispatch = useDispatch();
  const { data: user, role } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const displayName = user?.name || user?.username || "User";
  const displayEmail = user?.email || "No email provided";
  const displayPhone = user?.phone || "No phone provided";
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member";
  const displayStatus = user?.status || "Active";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2024";

  const recentActivity = [
    {
      icon: <LogIn size={18} />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Signed in",
      time: "Today, 9:14 AM",
      meta: "Chrome · India"
    },
    {
      icon: <Edit size={18} />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Profile updated",
      time: "Yesterday, 3:40 PM",
      meta: "Settings"
    },
    {
      icon: <Lock size={18} />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Password changed",
      time: "Jun 10, 11:02 AM",
      meta: "Security"
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9ff] py-12 px-4 flex items-start justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#002629] to-[#083d41] relative">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(135deg,#38656a_0px,#38656a_2px,transparent_2px,transparent_24px)]" />
          </div>

          <div className="px-8 pb-10 relative">
            <div className="-mt-16 mb-6 flex justify-between items-end">
              <InitialsAvatar name={displayName} />
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-2xl text-sm font-semibold border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {displayStatus}
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#002629] tracking-tight">
                {displayName}
              </h1>
              <p className="text-[#38656a] font-medium">
                {displayRole} · Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Account Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<User size={20} />} label="Full Name" value={displayName} />
            <InfoCard icon={<Mail size={20} />} label="Email" value={displayEmail} />
            <InfoCard icon={<Phone size={20} />} label="Phone" value={displayPhone} />
            <InfoCard icon={<Shield size={20} />} label="Access Role" value={displayRole} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Recent Activity</h2>
          </div>

          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 py-4 ${i !== recentActivity.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                  <span className={item.iconColor}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.time}</p>
                </div>
                <span className="text-sm text-slate-500 font-medium">{item.meta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Actions</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-[#002629] hover:bg-[#083d41] text-white px-6 py-3 rounded-2xl font-medium transition-colors">
              <Edit size={18} /> Edit Profile
            </button>
            <button className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-2xl font-medium transition-colors">
              <Lock size={18} /> Change Password
            </button>
            <button className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-2xl font-medium transition-colors">
              <Bell size={18} /> Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#002629]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="font-semibold text-slate-800 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
      <p className="text-3xl font-bold text-[#002629]">{number}</p>
      <p className="text-xs uppercase tracking-widest font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
}