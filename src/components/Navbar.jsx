import { useState, useEffect } from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";


export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, data } = useSelector(
    (state) => state.auth
  );

  const [localSearch, setLocalSearch] = useState("");

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <nav className="flex justify-between items-center px-8 py-4 max-w-350 mx-auto h-16">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#002629]">
            ePustakalay
          </h1>

          <div className="hidden md:flex gap-8 items-center text-base">
            
          <NavLink to="/" className={linkStyles}>
               Home
            </NavLink>
            <NavLink to="/books" className={linkStyles}>
              Books
            </NavLink>
            <NavLink to="/wishlist" className={linkStyles}> {/* Added proper /wishlist path */}
              Wishlist
            </NavLink>

          </div>
        </div>

        <div className="flex items-center gap-6 py-5">
          <div className="hidden lg:flex items-center bg-slate-200/50 rounded-lg px-3 py-2 w-64">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search the collection..."
              value={localSearch}
              onChange={handleSearchChange}
              className="bg-transparent outline-none ml-2 text-sm w-full"
            />

          </div>

          <ShoppingCart size={18} />
          {/* <User size={18} /> */}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
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
            <div className="flex gap-3">
              <NavLink to="/login" 
               className="px-4 py-2 border rounded-md font-semibold"
              >Login
              
              </NavLink>

              <NavLink
              to="/signup"
              className="px-4 py-2 bg-[#002629] text-white rounded-md font-semibold"
              >
                Sign Up
              </NavLink>

            </div>
          )}

        </div>
      </nav>
    </header>
  );
}