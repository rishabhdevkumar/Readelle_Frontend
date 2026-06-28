import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe, updateUser } from "../redux/slices/authSlice";
import axiosInstance from "../helpers/axiosInstance";
import { logActivity, getActivities } from "../helpers/activityLogger";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Shield, Clock,
  Edit, Lock, X, Eye, EyeOff,
  Loader2, Settings, LogIn,
} from "lucide-react";

/* ─── Initials Avatar ────────────────────────────────────────── */
function InitialsAvatar({ name, size = 96 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shadow-xl border-4 border-white"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: "linear-gradient(135deg, #002629, #38656a)",
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Info Card ──────────────────────────────────────────────── */
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

/* ─── Edit Profile Modal ─────────────────────────────────────── */
function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName]   = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    await onSave({ name: name.trim(), phone: phone.trim() });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit size={18} className="text-[#002629]" />
            <h3 className="font-bold text-[#002629]">Edit Profile</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002629] focus:bg-white transition-all font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002629] focus:bg-white transition-all font-medium" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Email</label>
            <input type="email" value={user?.email || ""} disabled
              className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed font-medium" />
            <p className="text-[10px] text-slate-400 mt-1 ml-1">Email cannot be changed</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all cursor-pointer text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-3 bg-[#002629] hover:bg-[#083d41] text-white font-semibold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Change Password Modal ──────────────────────────────────── */
function ChangePasswordModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, newp: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const toggle = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return toast.error("Enter current password");
    if (form.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (form.newPassword !== form.confirmPassword) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      const res = await axiosInstance.put("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(res?.data?.message || "Password changed successfully!");
      onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({ label, field, showKey }) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input type={show[showKey] ? "text" : "password"} value={form[field]}
          onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#002629] focus:bg-white transition-all font-medium" />
        <button type="button" onClick={() => toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[#002629]" />
            <h3 className="font-bold text-[#002629]">Change Password</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <PasswordField label="Current Password"      field="currentPassword"  showKey="current" />
          <PasswordField label="New Password"          field="newPassword"      showKey="newp" />
          <PasswordField label="Confirm New Password"  field="confirmPassword"  showKey="confirm" />
          {form.newPassword && form.confirmPassword && (
            <p className={`text-xs font-semibold ${form.newPassword === form.confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
              {form.newPassword === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all cursor-pointer text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-3 bg-[#002629] hover:bg-[#083d41] text-white font-semibold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Format activity timestamp: "Today, 9:14 AM" / "Jun 10, 11:02 AM" ── */
function formatActivityTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now  = new Date();

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday)     return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
  return `${dateStr}, ${timeStr}`;
}

/* ─── Activity icon config ───────────────────────────────────── */
function getActivityStyle(type) {
  switch (type) {
    case "login":
      return { icon: <LogIn size={18} />,  iconBg: "bg-blue-50",    iconColor: "text-blue-600" };
    case "profile_update":
      return { icon: <Edit size={18} />,   iconBg: "bg-amber-50",   iconColor: "text-amber-600" };
    case "password_change":
      return { icon: <Lock size={18} />,   iconBg: "bg-emerald-50", iconColor: "text-emerald-600" };
    default:
      return { icon: <Settings size={18} />, iconBg: "bg-slate-50", iconColor: "text-slate-500" };
  }
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MyAccount() {
  const dispatch = useDispatch();
  const { data: user, role } = useSelector((state) => state.auth);

  const [showEditModal, setShowEditModal]         = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activities, setActivities]               = useState([]);

  const refreshActivities = () => setActivities(getActivities());

  useEffect(() => {
    dispatch(getMe());
    refreshActivities();
  }, [dispatch]);

  const displayName   = user?.name || user?.username || "User";
  const displayEmail  = user?.email || "No email provided";
  const displayPhone  = user?.phone || "No phone provided";
  const displayRole   = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member";
  const displayStatus = user?.status || "Active";

  // Real join date from API — full format: "15 June 2026, 9:14 AM"
  const memberSince = user?.createdAt
    ? `${new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })}, ${new Date(user.createdAt).toLocaleTimeString("en-IN", {
        hour: "numeric", minute: "2-digit", hour12: true,
      })}`
    : null;

  /* ── Edit Profile Save ── */
  const handleSaveProfile = async ({ name, phone }) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    await dispatch(updateUser({ id: userId, data: { name, phone } }));
    dispatch(getMe());
    logActivity("profile_update", "Profile updated", "Settings");
    refreshActivities();
    setShowEditModal(false);
  };

  /* ── Password Change Success ── */
  const handlePasswordSuccess = () => {
    logActivity("password_change", "Password changed", "Security");
    refreshActivities();
    setShowPasswordModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] py-12 px-4 flex items-start justify-center">
      <div className="max-w-2xl w-full space-y-6">

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#002629] to-[#083d41] relative">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(135deg,#38656a_0px,#38656a_2px,transparent_2px,transparent_24px)]" />
          </div>

          <div className="px-8 pb-10 relative">
            <div className="-mt-16 mb-6 flex justify-between items-end">
              <div className="relative group">
                <InitialsAvatar name={displayName} />
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#002629] hover:bg-[#083d41] text-white flex items-center justify-center border-2 border-white transition-all cursor-pointer shadow-md hover:scale-105"
                  title="Edit Profile"
                >
                  <Edit size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-2xl text-sm font-semibold border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {displayStatus}
              </div>
            </div>

            {/* Name + Role + Member since (inline, below name) */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#002629] tracking-tight">
                {displayName}
              </h1>
              <p className="text-[#38656a] font-medium mt-1">
                {displayRole}{memberSince ? ` · ${memberSince}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── Account Details ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Account Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<User size={20} />}   label="Full Name"   value={displayName} />
            <InfoCard icon={<Mail size={20} />}   label="Email"       value={displayEmail} />
            <InfoCard icon={<Phone size={20} />}  label="Phone"       value={displayPhone} />
            <InfoCard icon={<Shield size={20} />} label="Access Role" value={displayRole} />
          </div>
        </div>

        {/* ── Recent Activity (functional — localStorage) ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Recent Activity</h2>
          </div>

          {activities.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Clock size={32} className="text-slate-200" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs">Your actions will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((item, i) => {
                const { icon, iconBg, iconColor } = getActivityStyle(item.type);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 py-4 ${
                      i !== activities.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <span className={iconColor}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500">{formatActivityTime(item.time)}</p>
                    </div>
                    <span className="text-sm text-slate-500 font-medium flex-shrink-0">{item.meta}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-[#38656a]" size={20} />
            <h2 className="uppercase text-xs font-bold tracking-widest text-slate-500">Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 bg-[#002629] hover:bg-[#083d41] text-white px-6 py-3 rounded-2xl font-medium transition-colors cursor-pointer shadow-md shadow-[#002629]/20"
            >
              <Edit size={18} /> Edit Profile
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 border-2 border-[#002629] text-[#002629] hover:bg-[#002629] hover:text-white px-6 py-3 rounded-2xl font-medium transition-all cursor-pointer"
            >
              <Lock size={18} /> Change Password
            </button>
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </div>
  );
}