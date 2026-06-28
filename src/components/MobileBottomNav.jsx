import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home, BookOpen, Heart, LogOut } from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      show: true,
    },
    {
      name: "Books",
      path: "/books",
      icon: BookOpen,
      show: true,
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: Heart,
      show: true,
    },
    {
      name: "Logout",
      path: null,
      icon: LogOut,
      show: isLoggedIn,
      onClick: handleLogout,
    },
  ];

  const linkStyles = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-2 w-full relative transition-all duration-200 ${
      isActive ? "text-[#002629]" : "text-slate-400"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <nav className="flex items-center w-full py-1">
        {navItems.map(
          (item) =>
            item.show && (
              <div key={item.name} className="relative group flex-1">
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="flex flex-col items-center justify-center gap-1 py-2 w-full text-slate-400 hover:text-[#002629] transition-all duration-200"
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-slate-200 group-hover:border-[#002629] group-hover:bg-[#002629]/5 transition-all duration-200">
                      <item.icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium">{item.name}</span>
                  </button>
                ) : (
                  <NavLink to={item.path} className={linkStyles}>
                    {({ isActive }) => (
                      <>
                        <div 
                          className={`relative w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                            isActive 
                              ? "border-[#002629] bg-[#002629]/5" 
                              : "border-slate-200 group-hover:border-[#002629] group-hover:bg-[#002629]/5"
                          }`}
                        >
                          <item.icon
                            size={20}
                            strokeWidth={2}
                            fill={isActive ? "#002629" : "none"}
                          />
                        </div>
                        <span className="text-xs font-medium">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            )
        )}
      </nav>
    </div>
  );
}
