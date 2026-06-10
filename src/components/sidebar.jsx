import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, LogOut,
  X, Mail, Phone, Shield, Calendar, User
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

/* ─── Nav items ──────────────────────────────────────────────── */
const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/admin" },
  { label: "Manage Books", icon: BookOpen,         to: "/admin/books" },
  { label: "Users",        icon: Users,            to: "/admin/users" },
  { label: "Orders",       icon: ClipboardList,    to: "/admin/orders" },
];

/* ─── Role label map ─────────────────────────────────────────── */
const ROLE_LABELS = {
  admin:  "Administrator",
  user:   "Member",
  seller: "Curator",
};

/* ─── Avatar from initials ───────────────────────────────────── */
function InitialsAvatar({ name, size = 36 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg,#0a2f35,#1d545c)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: size * 0.36, fontWeight: 800,
        flexShrink: 0, letterSpacing: 0.5,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Profile Panel (slide-in overlay) ──────────────────────── */
function ProfilePanel({ data, role, displayName, roleLabel, onClose, onLogout }) {
  const joinDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
        onClick={onClose}
      />

      {/* Panel — sits over the sidebar */}
      <div
        className="fixed top-[70px] left-0 w-[280px] bottom-0 z-[60] bg-white border-r border-slate-100 shadow-2xl flex flex-col"
        style={{ animation: 'slideInLeft 0.22s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0a2f35] to-[#1d545c] p-5 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={displayName} size={46} />
            <div className="leading-tight">
              <p className="font-extrabold text-white text-sm">{displayName}</p>
              <span className="text-[10px] font-bold tracking-widest text-teal-200/80 uppercase block mt-1">
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Info List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Account Details</p>

          {/* Name */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0a2f35]/8 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-[#0a2f35]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Full Name</p>
              <p className="font-bold text-slate-700 text-xs truncate mt-0.5">{data?.name || displayName || 'N/A'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0a2f35]/8 flex items-center justify-center flex-shrink-0">
              <Mail className="w-3.5 h-3.5 text-[#0a2f35]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email Address</p>
              <p className="font-bold text-slate-700 text-xs truncate mt-0.5">{data?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Phone */}
          {data?.phone && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#0a2f35]/8 flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-[#0a2f35]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Phone</p>
                <p className="font-bold text-slate-700 text-xs mt-0.5">{data.phone}</p>
              </div>
            </div>
          )}

          {/* Role */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0a2f35]/8 flex items-center justify-center flex-shrink-0">
              <Shield className="w-3.5 h-3.5 text-[#0a2f35]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Permission Role</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-xs text-slate-700">{roleLabel}</span>
                <span className="text-[9px] font-bold bg-[#0a2f35]/10 text-[#0a2f35] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  {role || 'admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0a2f35]/8 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#0a2f35]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Member Since</p>
              <p className="font-bold text-slate-700 text-xs mt-0.5">{joinDate}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Account Status</p>
              <p className="font-bold text-emerald-700 text-xs mt-0.5">{data?.status || 'Active'}</p>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all cursor-pointer text-xs border border-red-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data, role } = useSelector((state) => state.auth);

  const displayName =
    data?.name ||
    data?.username ||
    (data?.email ? data.email.split("@")[0] : "User");

  const roleLabel = ROLE_LABELS[role] || role || "Member";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-[70px] bottom-0 left-0 w-[260px] z-40 flex flex-col bg-white border-r border-slate-100
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
          {navItems.map(item => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={toggleSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  w-full text-left transition-all duration-200 cursor-pointer
                  hover:translate-x-0.5 active:scale-[0.98]
                  ${isActive
                    ? 'bg-[#0a2f35] text-white shadow-sm shadow-[#0a2f35]/10 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0a2f35]'}`}
              >
                <IconComponent className="w-[18px] h-[18px]" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Original compact profile card at bottom ── */}
        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            {/* Clickable avatar + name → opens profile panel */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              <InitialsAvatar name={displayName} size={38} />
              <div className="min-w-0 leading-tight">
                <span className="font-bold text-xs text-slate-700 truncate block">{displayName}</span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block mt-0.5">{roleLabel}</span>
              </div>
            </button>

            {/* Logout icon button — same as original */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-[17px] h-[17px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Panel overlay */}
      {isProfileOpen && (
        <ProfilePanel
          data={data}
          role={role}
          displayName={displayName}
          roleLabel={roleLabel}
          onClose={() => setIsProfileOpen(false)}
          onLogout={() => { setIsProfileOpen(false); handleLogout(); }}
        />
      )}
    </>
  );
};

export default Sidebar;
