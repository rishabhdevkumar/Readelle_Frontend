import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getAllBooks } from "../redux/slices/bookSlice";

const colors = {
  primary: "#002629",
  primaryContainer: "#083d41",
  onPrimaryContainer: "#7aa8ac",
  secondary: "#4a6363",
  secondaryContainer: "#cce8e7",
  onSecondaryContainer: "#506969",
  tertiary: "#381905",
  surface: "#f7f9ff",
  surfaceContainer: "#ebeef4",
  surfaceContainerLow: "#f1f4fa",
  surfaceContainerHigh: "#e5e8ee",
  surfaceContainerHighest: "#dfe3e8",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#181c20",
  onSurfaceVariant: "#404849",
  outlineVariant: "#c0c8c9",
  outline: "#707979",
};

const StarIcon = ({ filled = true, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? colors.tertiary : "none"} stroke={colors.tertiary} strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const HeartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const BookOpenIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ShareIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const RssIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
  </svg>
);

const reviews = [
  {
    stars: 5,
    text: "An absolute classic that feels even more relevant today. The writing is incredibly lyrical and poignant.",
    initials: "JD",
    name: "Julianne Devis",
    label: "Verified Reader",
  },
  {
    stars: 4,
    text: "Beautifully designed edition. The cover alone is worth the purchase, but the story never gets old.",
    initials: "MK",
    name: "Marcus King",
    label: "Verified Reader",
  },
  {
    stars: 5,
    text: "A tragic but essential read. Fitzgerald's use of color and symbolism is unparalleled. Prompt delivery from ePustakalay!",
    initials: "SL",
    name: "Sarah Linn",
    label: "Verified Reader",
  },
];


const navLinks = ["Home", "Books", "Wishlist"];

export default function BookdetailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Books");
  const [cartAdded, setCartAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { id } = useParams();

  const books = useSelector((state) => state.books.booksData || []);
  const isLoading = useSelector((state) => state.books.isLoading);

  // Fetch books if not already loaded
  useEffect(() => {
    if (books.length === 0) {
      dispatch(getAllBooks());
    }
  }, [dispatch, books.length]);

  const book = books.find((b) => b._id === id);

  // Show loading state
  if (isLoading || (!book && books.length === 0)) {
    return (
      <div style={{ background: colors.surface, minHeight: "100vh" }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#002629] border-r-transparent"></div>
          <p className="mt-4 text-[#404849] font-medium">Loading book details...</p>
        </div>
      </div>
    );
  }

  // Show error if book not found after loading
  if (!book) {
    return (
      <div style={{ background: colors.surface, minHeight: "100vh" }} className="flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-[#002629] mb-4 font-['Manrope']">Book Not Found</h1>
          <p className="text-[#404849] mb-6">Sorry, we couldn't find the book you're looking for.</p>
          <a
            href="/books"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#002629] to-[#083d41] text-white rounded-lg font-semibold hover:opacity-95 transition-opacity no-underline"
          >
            Browse All Books
          </a>
        </div>
      </div>
    );
  }


  const handleCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  
const metaItems = [
  { label: "Format", value: "Hardcover" },
  { label: "Pages", value: "180 pp." },
  { label: "Language", value: book.language },
  { label: "Published", value: "1925" },
];

  return (
    <div style={{ background: colors.surface, color: colors.onSurface, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-headline { font-family: 'Manrope', sans-serif; }
        .book-gradient { background: linear-gradient(135deg, #002629 0%, #083d41 100%); }
        .nav-glass { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .cover-hover { transition: transform 0.5s cubic-bezier(.22,1,.36,1); }
        .cover-hover:hover { transform: scale(1.02); }
        .btn-scale:active { transform: scale(0.96); }
        .review-arrow { transition: transform 0.2s; }
        .review-btn:hover .review-arrow { transform: translateX(4px); }
        .footer-social:hover { background: #002629; color: white; }
        .footer-social { transition: all 0.2s; }
        .search-input:focus { outline: none; box-shadow: 0 0 0 2px #002629; }
        .read-now-btn:hover { box-shadow: 0 12px 36px rgba(26,107,112,0.5) !important; transform: translateY(-1px); }
      `}</style>

      
      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20 lg:pb-24">
        {/* Book Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left: Cover */}
          <div className="md:col-span-5" style={{ position: "relative" }}>
            <div
              className="cover-hover"
              style={{
                aspectRatio: "3/4", borderRadius: 16, overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,38,41,0.22)", background: colors.surfaceContainerHighest,
              }}
            >
              <img
                src={book.cover_image}
                alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Badge */}
            <div style={{
              position: "absolute", top: 12, left: 12,
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              padding: "6px 12px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.3)",
              color: "white", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            }}
              className="font-headline md:top-5 md:left-5 md:text-[11px] md:px-4 md:py-2">
              Modern Classic
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-7 md:gap-8" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Title & Author */}
            <div className="md:gap-4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h1 className="font-headline md:text-5xl lg:text-[52px] md:tracking-[-2px]" style={{ fontSize: 32, fontWeight: 800, color: colors.primary, letterSpacing: "-1px", lineHeight: 1.05, margin: 0 }}>
                {book.title}
              </h1>
              <div className="md:gap-4" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="md:text-lg" style={{ fontSize: 15, color: colors.onSurfaceVariant, fontWeight: 500 }}> {book.author} </span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.outlineVariant, display: "inline-block" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <StarIcon filled size={14} />
                  <span className="md:text-[15px]" style={{ fontWeight: 700, fontSize: 14 }}>4.8</span>
                  <span className="md:text-sm" style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>(1,240 reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="font-headline md:text-[38px]" style={{ fontSize: 32, fontWeight: 800, color: colors.primaryContainer }}>
             ₹{book.price}
            </div>

            {/* Synopsis */}
            <div className="md:gap-3" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h3 className="font-headline md:text-[11px]" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.onSurfaceVariant, margin: 0 }}>
                Synopsis
              </h3>
              <p className="md:text-[17px]" style={{ fontSize: 15, lineHeight: 1.75, color: `${colors.onSurface}cc`, maxWidth: 560, margin: 0 }}>
                {book.description}
              </p>
            </div>

            {/* Meta Bento */}
            <div className="sm:grid-cols-4 md:gap-3" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {metaItems.map(({ label, value }) => (
                <div key={label} className="md:p-4" style={{ background: colors.surfaceContainerLow, padding: "12px", borderRadius: 10 }}>
                  <span className="md:text-[10px]" style={{ display: "block", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: colors.onSurfaceVariant, marginBottom: 4 }}>{label}</span>
                  <span className="md:text-[15px]" style={{ fontWeight: 700, fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="md:gap-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="book-gradient btn-scale font-headline"
                onClick={handleCart}
                style={{
                  color: "white", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 8px 24px rgba(0,38,41,0.25)", transition: "box-shadow 0.2s", flex: 1,
                  justifyContent: "center",
                }}
              >
                <CartIcon size={18} />
                <span className="hidden sm:inline">{cartAdded ? "Added!" : "Add to Cart"}</span>
                <span className="sm:hidden">{cartAdded ? "Added!" : "Add"}</span>
              </button>
              <button
                className="btn-scale font-headline"
                onClick={() => setWishlisted(!wishlisted)}
                style={{
                  background: colors.surfaceContainerHighest, color: colors.primary,
                  padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.15s", flex: 1, justifyContent: "center",
                }}
              >
                <HeartIcon size={18} />
                <span className="hidden sm:inline">{wishlisted ? "Wishlisted ✓" : "Add to Wishlist"}</span>
                <span className="sm:hidden">{wishlisted ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Read Now Button */}
            <button
              className="btn-scale font-headline read-now-btn"
              onClick={() => navigate(`/books/${id}/chapters`)}
              style={{
                background: "linear-gradient(135deg, #1a6b70 0%, #0d4a4e 100%)",
                color: "white",
                padding: "16px 32px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                boxShadow: "0 8px 28px rgba(26,107,112,0.35)",
                transition: "box-shadow 0.2s, transform 0.15s",
                letterSpacing: "0.5px",
              }}
            >
              <BookOpenIcon size={20} />
              <span>Read Now</span>
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="md:mt-24" style={{ marginTop: 64 }}>
          <div className="sm:flex-row sm:justify-between sm:items-end md:mb-12" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            <div>
              <h2 className="font-headline md:text-4xl" style={{ fontSize: 28, fontWeight: 800, color: colors.primary, margin: "0 0 6px 0" }}>
                Reader Reviews
              </h2>
              <p className="md:text-base" style={{ color: colors.onSurfaceVariant, margin: 0, fontSize: 14 }}>Hear from our community of book lovers.</p>
            </div>
            <button
              className="review-btn font-headline md:text-[15px] md:gap-2"
              style={{
                background: "transparent", border: "none", cursor: "pointer", color: colors.primary,
                fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Write a Review
              <span className="review-arrow"><ArrowRightIcon size={16} /></span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="md:grid-cols-2 lg:grid-cols-3 md:gap-7">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="md:p-8 md:gap-5"
                style={{
                  background: colors.surfaceContainerLowest, padding: 24, borderRadius: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: `1px solid ${colors.outlineVariant}20`,
                  display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16,
                }}
              >
                <div>
                  <div className="md:mb-4" style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                    {[...Array(5)].map((_, s) => <StarIcon key={s} filled={s < r.stars} size={15} />)}
                  </div>
                  <p className="md:text-base" style={{ color: `${colors.onSurface}e8`, fontStyle: "italic", lineHeight: 1.7, margin: 0, fontSize: 14 }}>
                    "{r.text}"
                  </p>
                </div>
                <div className="md:gap-3" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="font-headline md:w-10 md:h-10 md:text-[13px]" style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `${colors.primaryContainer}18`, color: colors.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12,
                  }}>{r.initials}</div>
                  <div>
                    <p className="md:text-sm" style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{r.name}</p>
                    <p className="md:text-xs" style={{ fontSize: 11, color: colors.onSurfaceVariant, margin: 0 }}>{r.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      
    </div>
  );
}
