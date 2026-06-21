import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getChaptersByBook } from "../redux/slices/chapterSlice";
import { getAllBooks } from "../redux/slices/bookSlice";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BookOpenIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const PlusIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const NoteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HighlightIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M15.232 5.232l3.536 3.536-9.192 9.192-3.89.975.974-3.89 8.572-8.813zm1.414-1.414a2 2 0 0 1 2.828 0l.708.708a2 2 0 0 1 0 2.828L7.757 20.09a1 1 0 0 1-.44.263l-5 1.25a1 1 0 0 1-1.22-1.22l1.25-5a1 1 0 0 1 .263-.44L16.646 3.818z"/>
  </svg>
);

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  primary:           "#002629",
  primaryContainer:  "#083d41",
  accent:            "#1a6b70",
  surface:           "#f7f9ff",
  surfaceLowest:     "#ffffff",
  surfaceLow:        "#f1f4fa",
  surfaceHigh:       "#e5e8ee",
  surfaceHighest:    "#dfe3e8",
  onSurface:         "#181c20",
  onVariant:         "#404849",
  outline:           "#707979",
  outlineVariant:    "#c0c8c9",
  highlight:         "#fff3c4",
  highlightBorder:   "#f5c842",
  highlightText:     "#7a5c00",
};

// ─── Highlight text rendering helper ─────────────────────────────────────────
function renderHighlightedText(text, highlights = []) {
  if (!highlights || highlights.length === 0) return text;
  
  const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);
  const escaped = sortedHighlights.map(h => h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isHighlighted = sortedHighlights.some(h => h.toLowerCase() === part.toLowerCase());
    return isHighlighted ? (
      <mark 
        key={i} 
        style={{ 
          background: C.highlight, 
          color: C.highlightText,
          padding: "2px 4px",
          borderRadius: "4px",
          fontWeight: 600,
          border: `1.5px solid ${C.highlightBorder}`
        }}
      >
        {part}
      </mark>
    ) : part;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter Card
// ─────────────────────────────────────────────────────────────────────────────
function ChapterCard({ chapter, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(chapter, index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  hovered ? C.primaryContainer : C.surfaceLowest,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        border: `1.5px solid ${hovered ? C.primaryContainer : C.outlineVariant + "55"}`,
        display: "flex", alignItems: "center", gap: 14,
        transition: "all 0.22s cubic-bezier(.22,1,.36,1)",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,38,41,0.18)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform:  hovered ? "translateY(-2px)" : "none",
        userSelect: "none",
      }}
    >
      {/* Number badge */}
      <div style={{
        minWidth: 42, height: 42, borderRadius: 10,
        background: hovered ? "rgba(255,255,255,0.13)" : `${C.primaryContainer}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 14,
        color: hovered ? "rgba(255,255,255,0.9)" : C.primary,
        flexShrink: 0,
        border: hovered ? "1.5px solid rgba(255,255,255,0.18)" : `1.5px solid ${C.outlineVariant}44`,
        transition: "all 0.22s",
      }}>
        {String(chapter.chapter_number || index + 1).padStart(2, "0")}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 15,
          color: hovered ? "#ffffff" : C.onSurface,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color 0.2s",
        }}>
          Chapter {chapter.chapter_number || index + 1}
        </p>
        <p style={{
          margin: "3px 0 0",
          fontFamily: "'Inter',sans-serif",
          fontWeight: 600,
          fontSize: 13.5,
          color: hovered ? "rgba(255,255,255,0.75)" : C.onVariant,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          transition: "color 0.2s",
        }}>
          {chapter.chapter_title || chapter.title || "Untitled Chapter"}
        </p>
        {chapter.description && (
          <p style={{
            margin: "3px 0 0", fontSize: 12.5,
            color: hovered ? "rgba(255,255,255,0.55)" : C.outline,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            transition: "color 0.2s",
          }}>
            {chapter.description}
          </p>
        )}
      </div>

      {/* "Notes" hint + arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          color: hovered ? "rgba(255,255,255,0.6)" : C.onVariant,
          fontFamily: "'Manrope',sans-serif",
          transition: "color 0.2s",
        }}>
          Notes
        </span>
        <div style={{
          color: hovered ? "rgba(255,255,255,0.7)" : C.outlineVariant,
          transform: hovered ? "translateX(3px)" : "none",
          transition: "transform 0.2s, color 0.2s",
        }}>
          <ChevronRightIcon size={17} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChapterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id }   = useParams();

  const chapters   = useSelector((s) => s.chapter?.chaptersData || []);
  const books      = useSelector((s) => s.books?.booksData       || []);
  const isLoading  = useSelector((s) => s.books?.isLoading);
  const isLoggedIn = useSelector((s) => s.auth?.isLoggedIn);



  const book = books.find((b) => b._id === id);

  useEffect(() => {
    if (id) dispatch(getChaptersByBook(id));
    if (books.length === 0) dispatch(getAllBooks());
  }, [id, dispatch]);

  const handleChapterClick = (chapter, index) => {
    if (!isLoggedIn) {
      // Save current path so login can redirect back here
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    navigate(`/books/${id}/chapters/${chapter._id}/notes`);
  };

  // Loading
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", background: C.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44,
            border: `4px solid ${C.primaryContainer}`, borderTopColor: "transparent",
            borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite",
          }} />
          <p style={{
            marginTop: 14, fontFamily: "'Manrope',sans-serif",
            fontWeight: 600, color: C.onVariant, fontSize: 14,
          }}>
            Loading chapters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.surface, fontFamily: "'Inter',sans-serif" }}>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin      { to   { transform: rotate(360deg); } }
        @keyframes fadeInUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp   { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes modalFadeIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .ch-card { animation: fadeInUp 0.38s ease both; }
      `}</style>

      {/* ── Hero banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
        padding: "clamp(72px,11vw,104px) clamp(16px,5vw,56px) clamp(28px,5vw,48px)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-70,  right:-70,  width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:"35%", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />

        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>
          {/* Back button */}
          <button
            onClick={() => navigate(`/books/${id}`)}
            style={{
              background: "rgba(255,255,255,0.13)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.92)",
              borderRadius: 10, padding: "8px 16px",
              fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              marginBottom: 26, transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
          >
            <ArrowLeftIcon size={15} />
            Back to Book
          </button>

          {/* Book info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {book?.cover_image && (
              <div style={{
                width: 56, height: 74, borderRadius: 8, overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.28)", flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.22)",
              }}>
                <img src={book.cover_image} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div>
              <h1 style={{
                margin: 0, fontFamily: "'Manrope',sans-serif", fontWeight: 800,
                fontSize: "clamp(22px,5vw,36px)", color: "#ffffff",
                lineHeight: 1.15, letterSpacing: "-0.5px",
              }}>
                {book?.title || "Book Chapters"}
              </h1>
              {book?.author && (
                <p style={{
                  margin: "5px 0 0", fontSize: 13,
                  color: "rgba(255,255,255,0.62)",
                  fontFamily: "'Manrope',sans-serif", fontWeight: 500,
                }}>
                  by {book.author}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chapter list ── */}
      <div style={{
        maxWidth: 820, margin: "0 auto",
        padding: "clamp(24px,5vw,44px) clamp(14px,4vw,24px) 80px",
      }}>
        {chapters.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "68px 24px",
            background: C.surfaceLowest, borderRadius: 16,
            border: `1.5px dashed ${C.outlineVariant}`,
          }}>
            <div style={{ color: C.outlineVariant }}><BookOpenIcon size={52} /></div>
            <h2 style={{
              fontFamily: "'Manrope',sans-serif", fontWeight: 800,
              fontSize: 22, color: C.primary, margin: "16px 0 8px",
            }}>No Chapters Yet</h2>
            <p style={{ color: C.onVariant, fontSize: 14, maxWidth: 300, margin: "0 auto 24px" }}>
              Chapters for this book haven't been added yet.
            </p>
            <button
              onClick={() => navigate(`/books/${id}`)}
              style={{
                background: `linear-gradient(135deg,${C.primary},${C.primaryContainer})`,
                color: "white", border: "none", borderRadius: 10,
                padding: "12px 24px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'Manrope',sans-serif",
              }}
            >← Back to Book</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id || index}
                className="ch-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ChapterCard
                  chapter={chapter}
                  index={index}
                  onClick={handleChapterClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
