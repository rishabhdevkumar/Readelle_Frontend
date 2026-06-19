import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getChaptersByBook } from "../redux/slices/chapterSlice";
import { getAllBooks } from "../redux/slices/bookSlice";
import {
  getNotesByBookAndChapter,
  createNote,
  clearNotes,
} from "../redux/slices/notesSlice";

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

// ─────────────────────────────────────────────────────────────────────────────
// Highlight text rendering helper
// ─────────────────────────────────────────────────────────────────────────────
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
// Notes Modal  (opens directly on chapter click)
// ─────────────────────────────────────────────────────────────────────────────
function NotesModal({ chapter, chapterIndex, bookId, onClose }) {
  const dispatch  = useDispatch();
  const notes     = useSelector((s) => s.notes?.notesData   || []);
  const isLoading = useSelector((s) => s.notes?.isLoading);

  const [text, setText]             = useState("");
  const [adding, setAdding]         = useState(false);

  const [noteHighlights, setNoteHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem("note_highlights");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("note_highlights", JSON.stringify(noteHighlights));
  }, [noteHighlights]);

  // fetch notes for this chapter
  useEffect(() => {
    dispatch(clearNotes());
    dispatch(getNotesByBookAndChapter({ bookId, chapterId: chapter._id }));
  }, [bookId, chapter._id, dispatch]);

  // close on Escape
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [onClose]);

  const handleHighlight = (noteId, noteText) => {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      toast.error("Please select text inside the note to highlight it.");
      return;
    }

    if (!noteText.includes(selection)) {
      toast.error("Please select text from inside the note content.");
      return;
    }

    setNoteHighlights(prev => {
      const current = prev[noteId] || [];
      if (current.some(h => h.toLowerCase() === selection.toLowerCase())) {
        toast.error("This text is already highlighted!");
        return prev;
      }
      return {
        ...prev,
        [noteId]: [...current, selection]
      };
    });

    window.getSelection().removeAllRanges();
  };

  const handleClearHighlights = (noteId) => {
    setNoteHighlights(prev => {
      const next = { ...prev };
      delete next[noteId];
      return next;
    });
  };

  const handleAdd = async () => {
    if (!text.trim()) return;
    setAdding(true);
    await dispatch(createNote({ book: bookId, chapter: chapter._id, noteText: text.trim() }));
    setText("");
    dispatch(getNotesByBookAndChapter({ bookId, chapterId: chapter._id }));
    setAdding(false);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(0,38,41,0.48)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        background: C.surfaceLowest,
        borderRadius: "20px",
        width: "100%", maxWidth: 660,
        maxHeight: "calc(100vh - 40px)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,38,41,0.3)",
        overflow: "hidden",
        animation: "modalFadeIn 0.3s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 20px 14px",
          borderBottom: `1px solid ${C.outlineVariant}44`,
          background: C.surfaceLow,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              {/* Chapter badge */}
              <div style={{
                background: `${C.primaryContainer}18`,
                borderRadius: 8, padding: "5px 11px",
                fontSize: 11, fontWeight: 700,
                color: C.primary,
                fontFamily: "'Manrope',sans-serif",
                letterSpacing: 1, flexShrink: 0,
              }}>
                CH {String(chapter.chapter_number || chapterIndex + 1).padStart(2, "0")}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Manrope',sans-serif", fontWeight: 800,
                  fontSize: 16, color: C.primary,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {chapter.chapter_title || chapter.title || `Chapter ${chapterIndex + 1}`}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <NoteIcon size={12} />
                  <span style={{
                    fontSize: 12, fontFamily: "'Manrope',sans-serif",
                    color: C.onVariant, fontWeight: 500,
                  }}>
                    {isLoading ? "Loading..." : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Close */}
            <button onClick={onClose} style={{
              background: C.surfaceHighest, border: "none", cursor: "pointer",
              borderRadius: 9, width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.onVariant, flexShrink: 0,
              transition: "background 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceHigh)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.surfaceHighest)}
            >
              <CloseIcon size={15} />
            </button>
          </div>
        </div>

        {/* ── Notes list ── */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "14px 16px 8px",
        }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.onVariant }}>
              <div style={{
                width: 32, height: 32,
                border: `3px solid ${C.accent}`, borderTopColor: "transparent",
                borderRadius: "50%", margin: "0 auto 12px",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 14, margin: 0 }}>
                Loading notes...
              </p>
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "44px 24px 20px" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: `${C.accent}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px", color: C.accent,
              }}>
                <NoteIcon size={28} />
              </div>
              <p style={{
                fontFamily: "'Manrope',sans-serif", fontWeight: 800,
                fontSize: 16, margin: "0 0 6px", color: C.primary,
              }}>
                No notes yet
              </p>
              <p style={{ fontSize: 13, color: C.onVariant, margin: 0 }}>
                Add your first note for this chapter below
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notes.map((note, i) => {
                const highlights = noteHighlights[note._id] || [];
                const hasHL = highlights.length > 0;
                return (
                  <div
                    key={note._id || i}
                    style={{
                      background: C.surfaceLow,
                      borderRadius: 12,
                      padding: "13px 14px",
                      border: `1.5px solid ${hasHL ? C.highlightBorder : C.outlineVariant + "55"}`,
                      animation: "fadeInUp 0.32s ease both",
                      animationDelay: `${i * 0.04}s`,
                      transition: "background 0.22s, border-color 0.22s",
                      position: "relative",
                    }}
                  >
                    {/* Highlight strip */}
                    {hasHL && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 4, borderRadius: "12px 0 0 12px",
                        background: C.highlightBorder,
                      }} />
                    )}

                    <p style={{
                      margin: 0,
                      fontSize: 14.5,
                      color: C.onSurface,
                      fontFamily: "'Inter',sans-serif",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      paddingLeft: hasHL ? 6 : 0,
                      transition: "color 0.2s, padding 0.2s",
                    }}>
                      {renderHighlightedText(note.noteText, highlights)}
                    </p>

                    {/* Highlight actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                      {hasHL && (
                        <button
                          onClick={() => handleClearHighlights(note._id)}
                          title="Clear all highlights in this note"
                          style={{
                            background: "transparent",
                            color: C.onVariant,
                            border: `1.5px solid ${C.outlineVariant}`,
                            borderRadius: 8,
                            padding: "5px 12px",
                            fontSize: 12, fontWeight: 700,
                            fontFamily: "'Manrope',sans-serif",
                            cursor: "pointer",
                            transition: "all 0.18s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceHigh; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => handleHighlight(note._id, note.noteText)}
                        title="Select text in the note above and click to highlight"
                        style={{
                          background: `${C.highlightBorder}22`,
                          color: "#b8860b",
                          border: `1.5px solid ${C.highlightBorder}66`,
                          borderRadius: 8,
                          padding: "5px 12px",
                          fontSize: 12, fontWeight: 700,
                          fontFamily: "'Manrope',sans-serif",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${C.highlightBorder}44`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${C.highlightBorder}22`; }}
                      >
                        <HighlightIcon size={12} />
                        Highlight Selection
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Add Note ── */}
        <div style={{
          padding: "12px 16px 20px",
          borderTop: `1px solid ${C.outlineVariant}44`,
          background: C.surfaceLow,
          flexShrink: 0,
        }}>
          <textarea
            placeholder="Write a note for this chapter..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }}
            rows={3}
            style={{
              width: "100%", borderRadius: 12,
              border: `1.5px solid ${C.outlineVariant}`,
              padding: "11px 13px", fontSize: 14,
              fontFamily: "'Inter',sans-serif", resize: "none",
              boxSizing: "border-box", color: C.onSurface,
              outline: "none", background: C.surfaceLowest,
              transition: "border-color 0.2s",
            }}
            onFocus={(e)  => (e.target.style.borderColor = C.accent)}
            onBlur={(e)   => (e.target.style.borderColor = C.outlineVariant)}
          />
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 10,
          }}>
            <span style={{ fontSize: 11, color: C.outline, fontFamily: "'Inter',sans-serif" }}>
              Ctrl+Enter to save
            </span>
            <button
              onClick={handleAdd}
              disabled={adding || !text.trim()}
              style={{
                background: text.trim()
                  ? `linear-gradient(135deg,${C.accent} 0%,${C.primaryContainer} 100%)`
                  : C.surfaceHighest,
                color: text.trim() ? "white" : C.outline,
                border: "none", cursor: text.trim() ? "pointer" : "not-allowed",
                borderRadius: 10, padding: "10px 22px",
                fontWeight: 700, fontSize: 13,
                fontFamily: "'Manrope',sans-serif",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: text.trim() ? "0 4px 14px rgba(26,107,112,0.28)" : "none",
                transition: "all 0.2s",
              }}
            >
              <PlusIcon size={14} />
              {adding ? "Saving..." : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

  const [activeChapter, setActiveChapter]       = useState(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

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
    setActiveChapter(chapter);
    setActiveChapterIdx(index);
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

      {/* ── Notes Modal (opens directly on chapter click) ── */}
      {activeChapter && (
        <NotesModal
          chapter={activeChapter}
          chapterIndex={activeChapterIdx}
          bookId={id}
          onClose={() => setActiveChapter(null)}
        />
      )}
    </div>
  );
}
