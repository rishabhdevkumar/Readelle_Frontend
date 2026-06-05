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

      {/* Sidebar panel - positioned below Header */}
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

        {/* ── User profile card at bottom ── */}
        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <InitialsAvatar name={displayName} size={38} />
              <div className="min-w-0 leading-tight">
                <span className="font-bold text-xs text-slate-700 truncate block">{displayName}</span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block mt-0.5">{roleLabel}</span>
              </div>
            </div>
            
            {/* Logout button */}
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
    </>
  );
};

export default Sidebar;
