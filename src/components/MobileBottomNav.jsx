import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home, BookOpen, Heart, ReceiptText, LogOut, User } from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.wishlistData || []);
  const wishlistCount = wishlistItems.length;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  // When logged in:  Home | Books | Wishlist | Orders | Account (tapping shows logout)
  // When logged out: Home | Books | Wishlist | Orders | Login
  const navItems = [
    { name: "Home",    path: "/",         icon: Home,        end: true              },
    { name: "Books",   path: "/books",    icon: BookOpen                            },
    { name: "Wishlist",path: "/wishlist", icon: Heart,       badge: wishlistCount   },
    { name: "Orders",  path: "/orders",   icon: ReceiptText                         },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <nav className="flex justify-around items-center px-2 py-2 max-w-md mx-auto">

        {/* ── Regular nav links ── */}
        {navItems.map(({ name, path, icon: Icon, end, badge }) => (
          <div key={name} className="relative group flex-1">
            <NavLink
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 px-4 w-full transition-all duration-200 ${
                  isActive ? "text-[#002629]" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? "border-[#002629] bg-[#002629]/5"
                        : "border-slate-200 group-hover:border-[#002629] group-hover:bg-[#002629]/5"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2} fill={isActive ? "#002629" : "none"} />
                    {badge > 0 && (
                      <span
                        className="absolute -top-1 -right-1 bg-[#002629] text-white rounded-full inline-flex items-center justify-center font-extrabold"
                        style={{
                          fontSize: "8px", minWidth: "14px", height: "14px",
                          padding: "0 3px", lineHeight: 1, border: "1.5px solid white",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{name}</span>
                </>
              )}
            </NavLink>
          </div>
        ))}

        {/* ── 5th slot: Account / Login ── */}
        <div className="relative group flex-1">
          {isLoggedIn ? (
            // Tapping "Account" navigates to My Account; long-press hint isn't needed
            // since we also show a Logout button inside /my-account.
            // We add a small logout button ABOVE the icon for quick access.
            <div className="flex flex-col items-center justify-center gap-1 py-2 px-4 w-full">
              {/* Quick-logout tap target sitting above the circle */}
              <button
                onClick={handleLogout}
                className="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-slate-200 group-hover:border-red-300 group-hover:bg-red-50 text-slate-400 group-hover:text-red-500 transition-all duration-200"
                aria-label="Logout"
              >
                <LogOut size={20} strokeWidth={2} />
              </button>
              <span className="text-xs font-medium text-slate-400 group-hover:text-red-500 transition-colors duration-200">
                Logout
              </span>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 px-4 w-full transition-all duration-200 ${
                  isActive ? "text-[#002629]" : "text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isActive
                        ? "border-[#002629] bg-[#002629]/5"
                        : "border-slate-200 group-hover:border-[#002629] group-hover:bg-[#002629]/5"
                    }`}
                  >
                    <User size={20} strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium">Login</span>
                </>
              )}
            </NavLink>
          )}
        </div>

      </nav>
    </div>
  );
}