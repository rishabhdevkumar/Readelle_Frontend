import { useState, useEffect } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import logo from "../assets/ePustakalayNewLogo.png";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.cartData || []);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  
  const wishlistItems = useSelector((state) => state.wishlist?.wishlistData || []);
  const wishlistCount = wishlistItems.length;

  const [localSearch, setLocalSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Sync local search input with URL search param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get("search") || "";
    setLocalSearch(urlSearch);
  }, [location.pathname, location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    const newParams = new URLSearchParams(location.search);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const linkStyles = ({ isActive }) =>
    `transition-all duration-200 relative pb-1 ${
      isActive
        ? "text-[#002629] after:w-full"
        : "text-slate-500 hover:text-[#002629] after:w-0"
    } after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#002629] after:transition-all after:duration-200`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <nav className="flex justify-between items-center px-4 md:px-8 py-4 max-w-350 mx-auto h-16">
          <div className="flex items-center gap-6 md:gap-12">
            <NavLink to="/" className="flex items-center">
              <img
                src={logo}
                alt="ePustakalay Logo"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </NavLink>

            <div className="hidden lg:flex gap-6 lg:gap-8 items-center text-base">
              <NavLink to="/" className={linkStyles}>
                Home
              </NavLink>
              <NavLink to="/books" className={linkStyles}>
                Books
              </NavLink>
              <NavLink to="/wishlist" className="relative">
                {({ isActive }) => (
                  <>
                    <span className={linkStyles({ isActive })}>
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -top-2 -right-3 bg-[#002629] text-white rounded-full inline-flex items-center justify-center font-extrabold"
                        style={{
                          fontSize: "9px",
                          minWidth: "16px",
                          height: "16px",
                          padding: "0 4px",
                          lineHeight: 1,
                          border: "1.5px solid white",
                        }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 py-5">
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center bg-slate-200/50 rounded-lg px-3 py-2 w-48 lg:w-64">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search the collection..."
                value={localSearch}
                onChange={handleSearchChange}
                className="bg-transparent outline-none ml-2 text-sm w-full"
              />
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden p-2 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-slate-600" />
            </button>

            {/* Cart Icon */}
            <NavLink
              to="/carts"
              aria-label="View shopping cart"
              className="relative p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} className="text-slate-600" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-[#002629] text-white rounded-full flex items-center justify-center font-extrabold"
                  style={{
                    fontSize: "9px",
                    minWidth: "16px",
                    height: "16px",
                    padding: "0 4px",
                    lineHeight: 1,
                    border: "1.5px solid white",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </NavLink>

            {isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-3">
                <NavLink
                  to="/my-account"
                  className="px-4 py-2 border rounded-md text-[#002629] border-[#002629] hover:bg-slate-100 font-semibold transition-all duration-200"
                >
                  My Account
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#002629] text-white rounded-md font-semibold transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-2 border rounded-md font-semibold text-[#002629] border-[#002629] hover:bg-slate-100 transition-all duration-200"
              >
                Login
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileSearch(false)}
        >
          <div
            className="bg-white p-4 shadow-lg animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              <div className="flex-1 flex items-center bg-slate-100 rounded-lg px-4 py-3">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search books, authors, categories..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  autoFocus
                  className="bg-transparent outline-none ml-3 text-sm w-full text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close search"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
