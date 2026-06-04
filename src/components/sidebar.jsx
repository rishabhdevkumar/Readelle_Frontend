import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, BookOpen, Users, ShoppingCart, LogOut } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

/* ─── Nav items ──────────────────────────────────────────────── */
const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/admin" },
  { label: "Manage Books", icon: BookOpen,         to: "/admin/books" },
  { label: "Users",        icon: Users,            to: "/admin/users" },
  { label: "Orders",       icon: ShoppingCart,     to: "/admin/orders" },
];

/* ─── Role label map ─────────────────────────────────────────── */
const ROLE_LABELS = {
  admin: "Administrator",
  user:  "Member",
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
        background: "linear-gradient(135deg,#0d3b38,#38656a)",
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

/* ─── Sidebar ────────────────────────────────────────────────── */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { data, role } = useSelector((state) => state.auth);

  // Prefer full name, fall back to username, then email prefix
  const displayName =
    data?.name ||
    data?.username ||
    (data?.email ? data.email.split("@")[0] : "User");

  const displayEmail = data?.email || "";
  const roleLabel    = ROLE_LABELS[role] || role || "Member";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[35] lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-[70px] bottom-0 left-0 w-[260px] z-40 flex flex-col bg-surface-low border-r border-outline-var/20
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map(item => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={toggleSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
                  w-full text-left transition-all duration-200
                  hover:translate-x-0.5 active:scale-[0.97]
                  ${isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/10'
                    : 'text-on-surface-var hover:bg-white/60'}`}
              >
                <IconComponent className="w-[17px] h-[17px]" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* ── User profile card at bottom ── */}
        <div className="mx-3 mb-3 rounded-2xl bg-surface-cont overflow-hidden">
          {/* User info */}
          <div className="flex items-center gap-3 px-3.5 py-3">
            <InitialsAvatar name={displayName} size={38} />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate text-on-surface leading-tight">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-[10px] truncate text-on-surface-var mt-0.5">
                  {displayEmail}
                </p>
              )}
              <span
                className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider
                  bg-primary/10 text-primary px-2 py-0.5 rounded-full"
              >
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold
              text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors
              border-t border-outline-var/15 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
