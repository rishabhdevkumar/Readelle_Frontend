import { useState, useEffect } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllBooks } from "../redux/slices/bookSlice";
import { getAllCategories } from "../redux/slices/categorySlice";
import { addToCart, getCart, addToGuestCart, setGuestCart } from "../redux/slices/cartSlice";
import { toggleWishlist, getAllWishlist } from "../redux/slices/wishlistSlice";
import toast from "react-hot-toast";

const colors = {
  primary: "#002629",
  primaryContainer: "#083d41",
  onPrimary: "#ffffff",
  surface: "#f7f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f1f4fa",
  surfaceContainer: "#ebeef4",
  surfaceContainerHigh: "#e5e8ee",
  surfaceContainerHighest: "#dfe3e8",
  onSurface: "#181c20",
  onSurfaceVariant: "#404849",
  outlineVariant: "#c0c8c9",
  surfaceTint: "#38656a",
  onSecondaryContainer: "#506969",
  secondaryContainer: "#cce8e7",
  inversePrimary: "#a0cfd3",
};


const languages = ["All", "English", "Hindi"];

function BookCard({ book, isInWishlist, onWishlistToggle }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const dispatch = useDispatch();

  const { isLoggedIn } = useSelector((state) => state.auth);

  const cartItem = useSelector(
    (state) => state.cart.cartData || []
  );


  const isInCart = cartItem.some(
    (item) => (item?.book?._id || item?.book) === book._id
  );

  const handleAdd = async (e) => {
    e.stopPropagation();

    if (isLoggedIn) {
      await dispatch(addToCart(book._id));
      await dispatch(getCart());
    } else {
      dispatch(addToGuestCart(book));
    }
    toast.success("Added to cart!");
  };


  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    setIsTogglingWishlist(true);
    await onWishlistToggle(book._id);
    setIsTogglingWishlist(false);
  };



  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-300 relative cursor-pointer"
      onClick={() => navigate(`/books/${book._id}`)}
      style={{
        background: colors.surfaceContainerLowest,
        boxShadow: hovered
          ? `0 20px 40px 0 rgba(24,28,32,0.07)`
          : "0 0 0 0 transparent",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio: "3/4", background: colors.surfaceContainerLow }}
      >
        <img
          src={book.cover_image}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: hovered
              ? `${colors.primary}0d`
              : `${colors.primary}00`,
          }}
        />

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          className="absolute top-2 md:top-3 right-2 md:right-3 w-8 h-8 md:w-9 md:h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 z-10"
          style={{
            background: isInWishlist ? colors.primary : 'rgba(255, 255, 255, 0.9)',
            color: isInWishlist ? colors.onPrimary : colors.primary,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="px-3 md:px-4 pb-4 md:pb-6 flex-1 flex flex-col">
        <span
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: `${colors.onSurfaceVariant}99`, fontSize: "10px", letterSpacing: "0.2em" }}
        >
          {book.genre}
        </span>
        <h3
          className="font-bold text-sm md:text-lg leading-snug mb-1 transition-colors duration-200 line-clamp-2"
          style={{
            fontFamily: "Manrope, sans-serif",
            color: hovered ? colors.surfaceTint : colors.primary,
          }}
        >
          {book.title}
        </h3>
        <p className="text-xs md:text-sm mb-3 md:mb-4 truncate" style={{ color: colors.onSurfaceVariant }}>
          {book.author}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span
            className="text-lg md:text-xl font-black"
            style={{ fontFamily: "Manrope, sans-serif", color: colors.primary }}
          >
            {book.price}
          </span>
          <button
            onClick={handleAdd}
            disabled={isInCart}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95"
            style={{
              // Switches to a success/disabled color profile if already in cart
              background: isInCart
                ? `linear-gradient(135deg, ${colors.surfaceVariant || '#e2e8f0'}, ${colors.surfaceContainerLow || '#cbd5e1'})`
                : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryContainer})`,
              color: isInCart ? (colors.onSurfaceVariant || '#64748b') : colors.onPrimary,
              cursor: isInCart ? 'not-allowed' : 'pointer',
            }}
          >
            {isInCart ? (
              // Checkmark Icon for "Added!" state
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              // Shopping Cart Icon for "Add" state
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-2.2-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 19.24 4H5.21L4.27 2H1v2h2l3.6 7.59L5.24 14c-.16.28-.24.61-.24.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.13 0-.25-.11-.25-.25l.03-.12L8.1 13h6.7z" />
              </svg>
            )}
            <span>{isInCart ? "Added" : "Add"}</span>
          </button>

        </div>
      </div>
    </div>
  );
}

export default function EPustakalay() {

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const books = useSelector(
    (state) => state.books.booksData || []
  );

  const categories = useSelector(
    (state) => state.categories.categoriesData || []
  );

  const { wishlistData } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllBooks());
    dispatch(getAllCategories());
    if (isLoggedIn) {
      dispatch(getCart());
      dispatch(getAllWishlist());
    } else {
      const guestCart = localStorage.getItem("guest_cart");
      if (guestCart) {
        try {
          dispatch(setGuestCart(JSON.parse(guestCart)));
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [dispatch, isLoggedIn]);

  const handleWishlistToggle = async (bookId) => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    await dispatch(toggleWishlist(bookId));
    // Refresh wishlist after toggle
    dispatch(getAllWishlist());
  };

  const isBookInWishlist = (bookId) => {
    return wishlistData.some(item => {
      const itemBookId = item.book && typeof item.book === 'object' ? item.book._id : item.book;
      return itemBookId === bookId;
    });
  };


  const maxPrice =
    books.length > 0
      ? Math.max(...books.map(book => book.price))
      : 10000;

  const queryParams = new URLSearchParams(location.search);
  const urlCategory = queryParams.get("category");
  const stateCategory = location.state?.selectedCategory;
  const initialCategory = stateCategory || urlCategory;

  const [checkedCategories, setCheckedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [activeLanguage, setActiveLanguage] = useState("");
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState("Popularity");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category filter whenever URL search params change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catFromUrl = params.get("category") || location.state?.selectedCategory || "";
    if (catFromUrl) {
      setCheckedCategories([catFromUrl]);
    } else {
      setCheckedCategories([]);
    }
  }, [location.search, location.state]);

  // Sync priceRange when books load
  useEffect(() => {
    if (books.length > 0) {
      setPriceRange(maxPrice);
    }
  }, [books, maxPrice]);

  const toggleCategory = (cat) => {
    setCheckedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // In-page live search from the header search bar (globalSearch event)
  const [liveSearch, setLiveSearch] = useState("");
  useEffect(() => {
    const handleSearch = (e) => setLiveSearch(e.detail || "");
    window.addEventListener('globalSearch', handleSearch);
    return () => window.removeEventListener('globalSearch', handleSearch);
  }, []);

  // When URL ?search= param changes (navigating from another page), sync liveSearch
  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search).get("search") || "";
    setLiveSearch(urlSearch);
  }, [location.search]);

  // Effective search = live typing OR URL param (whichever has value)
  const searchQuery = liveSearch || queryParams.get("search") || "";

  const filteredBooks = books.filter((book) => {
    const bookCategoryId = (book.category && typeof book.category === 'object') ? book.category._id : book.category;

    const categoryMatch =
      checkedCategories.length === 0 ||
      checkedCategories.includes(bookCategoryId);

    const languageMatch =
      activeLanguage === "" ||
      book.language === activeLanguage;

    const priceMatch = book.price <= priceRange;

    // Search query matches title, author, or category name
    const categoryName = (book.category && typeof book.category === 'object')
      ? book.category.category_name
      : (categories.find(c => c._id === bookCategoryId)?.category_name || "");

    const searchMatch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && languageMatch && priceMatch && searchMatch;
  });


  const sortedBooks = [...filteredBooks];

  switch (sortBy) {
    case "Price: Low to High":
      sortedBooks.sort((a, b) => a.price - b.price);
      break;

    case "Price: High to Low":
      sortedBooks.sort((a, b) => b.price - a.price);
      break;

    case "Newest Arrivals":
      sortedBooks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      break;

    default:
      break;
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: colors.surface, color: colors.onSurface, fontFamily: "Inter, sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:wght@100..900&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c0c8c9; border-radius: 10px; }
        input[type=range] { accent-color: #002629; }
        input[type=range]::-webkit-slider-thumb { cursor: pointer; }
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>


      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside
          className="hidden md:flex md:flex-col sticky left-0 top-0 pt-24 w-56 min-w-[14rem] max-w-[14rem] h-screen z-40 p-6 gap-4 overflow-y-auto"
          style={{ background: colors.surfaceContainerLow }}
        >
          <div className="mb-2">
            <h2
              className="font-bold text-lg"
              style={{ fontFamily: "Manrope, sans-serif", color: colors.primary }}
            >
              Library Filters
            </h2>
            <p
              className="text-xs uppercase tracking-widest mt-1"
              style={{ color: colors.onSurfaceVariant }}
            >
              Refine Curator View
            </p>
          </div>

          <div className="flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {/* Categories */}
            <section>
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: colors.primary }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                </svg>
                <span className="font-bold text-sm">Categories</span>
              </div>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => {
                  const isChecked = checkedCategories.includes(cat._id);
                  return (
                    <label
                      key={cat._id}
                      onClick={() => toggleCategory(cat._id)}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-150 hover:translate-x-1"
                      style={{
                        background: isChecked
                          ? colors.surfaceContainerLowest
                          : "transparent",
                        color: isChecked ? colors.primary : colors.onSurfaceVariant,
                        fontWeight: isChecked ? 700 : 400,
                        boxShadow: isChecked
                          ? "0 1px 4px rgba(0,38,41,0.06)"
                          : "none",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                        style={{
                          background: isChecked ? colors.primary : "transparent",
                          border: isChecked
                            ? `2px solid ${colors.primary}`
                            : `2px solid ${colors.outlineVariant}`,
                        }}
                      >
                        {isChecked && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{cat.category_name}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Price Range */}
            <section>
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: colors.primary }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                </svg>
                <span className="font-bold text-sm">Price Range</span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{ background: colors.surfaceContainerHighest }}
                />
                <div
                  className="flex justify-between mt-2 text-xs font-medium"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  <span>₹0</span>
                  <span className="font-bold" style={{ color: colors.primary }}>
                    ₹{priceRange}
                  </span>
                </div>
              </div>
            </section>

            {/* Languages */}
            <section>
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: colors.primary }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
                </svg>
                <span className="font-bold text-sm">Languages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang === "All" ? "" : lang)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150"
                    style={{
                      background:
                        (lang === "All" && activeLanguage === "") ||
                          activeLanguage === lang
                          ? colors.primary
                          : colors.surfaceContainerHigh,
                      color:
                        (lang === "All" && activeLanguage === "") ||
                          activeLanguage === lang
                          ? colors.onPrimary
                          : colors.onSurface,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <button
            className="w-full py-3 font-bold rounded-xl text-sm transition-all duration-200 mt-4 shadow-sm"
            style={{
              background: colors.primary,
              color: colors.onPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryContainer;
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primary;
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={() => {
              setCheckedCategories([]);
              setActiveLanguage("");
              setPriceRange(maxPrice);
              navigate("/books");
            }}
          >
            Reset All Filters
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8" style={{ background: "#f7f9ff", paddingTop: "100px" }}>
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8 md:mb-12 w-full">
            {/* Title */}
            <div className="w-full bg-white p-4 rounded-lg shadow-sm">
              <h1
                className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2"
                style={{ fontFamily: "Manrope, sans-serif", color: "#002629" }}
              >
                Curated Archive
              </h1>
              <p className="font-medium text-sm md:text-base" style={{ color: "#64748b" }}>
                Discover 12,408 hand-selected literary artifacts ready for your digital shelf.
              </p>
            </div>

            {/* Filters and Sort Row */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{
                  background: colors.surfaceContainerLow,
                  border: `1px solid ${colors.outlineVariant}33`,
                  color: colors.primary,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                Filters
              </button>

              {/* Sort Dropdown */}
              <div
                className="flex items-center px-3 md:px-4 py-2 rounded-xl"
                style={{
                  background: colors.surfaceContainerLow,
                  border: `1px solid ${colors.outlineVariant}33`,
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest mr-3"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold focus:outline-none cursor-pointer"
                  style={{ color: colors.primary }}
                >
                  <option value="Popularity" >Popularity</option>
                  <option value="Newest Arrivals" >Newest Arrivals</option>
                  <option value="Price: Low to High" >Price: Low to High</option>
                  <option value="Price: High to Low" >Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-9xl mx-auto ">
            {sortedBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                isInWishlist={isBookInWishlist(book._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>



          {/* Load More */}
          <div className="mt-12 md:mt-16 flex justify-center">
            <button
              className="px-6 md:px-8 py-3 md:py-4 font-bold rounded-full flex items-center gap-2 md:gap-3 transition-colors duration-200 text-xs md:text-sm"
              style={{
                background: colors.surfaceContainerLow,
                border: `1px solid ${colors.outlineVariant}1a`,
                color: colors.primary,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.surfaceContainerHighest)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = colors.surfaceContainerLow)
              }
            >
              View More Archive Items
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
              </svg>
            </button>
          </div>
        </main>
      </div>

      {/* Mobile Filter Sidebar Overlay */}
      {showMobileFilters && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Sidebar */}
          <aside
            className="fixed left-0 top-0 bottom-0 w-72 h-screen z-50 p-6 overflow-y-auto custom-scrollbar pb-24 animate-slideIn md:hidden"
            style={{ background: colors.surfaceContainerLowest }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="font-bold text-lg"
                  style={{ fontFamily: "Manrope, sans-serif", color: colors.primary }}
                >
                  Library Filters
                </h2>
                <p
                  className="text-xs uppercase tracking-widest mt-1"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Refine Curator View
                </p>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: colors.surfaceContainerHigh }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {/* Categories */}
              <section>
                <div
                  className="flex items-center gap-2 mb-4"
                  style={{ color: colors.primary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                  </svg>
                  <span className="font-bold text-sm">Categories</span>
                </div>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => {
                    const isChecked = checkedCategories.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        onClick={() => toggleCategory(cat._id)}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-150"
                        style={{
                          background: isChecked
                            ? colors.surfaceContainerLow
                            : "transparent",
                          color: isChecked ? colors.primary : colors.onSurfaceVariant,
                          fontWeight: isChecked ? 700 : 400,
                          boxShadow: isChecked
                            ? "0 1px 4px rgba(0,38,41,0.06)"
                            : "none",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={{
                            background: isChecked ? colors.primary : "transparent",
                            border: isChecked
                              ? `2px solid ${colors.primary}`
                              : `2px solid ${colors.outlineVariant}`,
                          }}
                        >
                          {isChecked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{cat.category_name}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Price Range */}
              <section>
                <div
                  className="flex items-center gap-2 mb-4"
                  style={{ color: colors.primary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                  </svg>
                  <span className="font-bold text-sm">Price Range</span>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style={{ background: colors.surfaceContainerHighest }}
                  />
                  <div
                    className="flex justify-between mt-2 text-xs font-medium"
                    style={{ color: colors.onSurfaceVariant }}
                  >
                    <span>₹0</span>
                    <span className="font-bold" style={{ color: colors.primary }}>
                      ₹{priceRange}
                    </span>
                  </div>
                </div>
              </section>

              {/* Languages */}
              <section>
                <div
                  className="flex items-center gap-2 mb-4"
                  style={{ color: colors.primary }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
                  </svg>
                  <span className="font-bold text-sm">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang === "All" ? "" : lang)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-150"
                      style={{
                        background:
                          (lang === "All" && activeLanguage === "") ||
                            activeLanguage === lang
                            ? colors.primary
                            : colors.surfaceContainerHigh,
                        color:
                          (lang === "All" && activeLanguage === "") ||
                            activeLanguage === lang
                            ? colors.onPrimary
                            : colors.onSurface,
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </section>

              {/* Reset Button */}
              <button
                className="w-full py-3 font-bold rounded-xl text-sm transition-all duration-200 shadow-sm"
                style={{
                  background: colors.primary,
                  color: colors.onPrimary,
                }}
                onClick={() => {
                  setCheckedCategories([]);
                  setActiveLanguage("");
                  setPriceRange(maxPrice);
                  navigate("/books");
                  setShowMobileFilters(false);
                }}
              >
                Reset All Filters
              </button>
            </div>
          </aside>
        </>
      )}

    </div>
  );
}
