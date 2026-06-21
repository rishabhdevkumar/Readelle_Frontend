import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getChaptersByBook, getChapterById } from "../redux/slices/chapterSlice";
import { getAllBooks } from "../redux/slices/bookSlice";
import {
  getNotesByBookAndChapter,
  createNote,
  deleteNote,
  clearNotes,
} from "../redux/slices/notesSlice";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  pageBg:          "#fafbf6",
  readerBg:        "#fdf9f0",
  panelBg:         "#ffffff",
  primary:         "#002629",
  primaryMid:      "#083d41",
  accent:          "#1a6b70",
  accentLight:     "#e8f4f5",
  onSurface:       "#1a1f1f",
  onVariant:       "#4a5568",
  outline:         "#8a9ba8",
  outlineVariant:  "#d1dce0",
  highlight1:      "#fff3c4",
  highlight1Border:"#f5c842",
  highlight1Text:  "#7a5c00",
  highlight2:      "#fce8e8",
  highlight2Border:"#f08080",
  highlight2Text:  "#8b1a1a",
  noteCardBg:      "#fffef8",
  noteAccent:      "#f5c842",
  headerBg:        "#f5f7fa",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PlusIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const HighlightIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.232 5.232l3.536 3.536-9.192 9.192-3.89.975.974-3.89 8.572-8.813zm1.414-1.414a2 2 0 0 1 2.828 0l.708.708a2 2 0 0 1 0 2.828L7.757 20.09a1 1 0 0 1-.44.263l-5 1.25a1 1 0 0 1-1.22-1.22l1.25-5a1 1 0 0 1 .263-.44L16.646 3.818z"/>
  </svg>
);
const BookOpenIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const NoteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ChevronLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

// ─── Highlight colours palette ────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { id: "yellow", bg: "#fff3c4", border: "#f5c842", text: "#7a5c00", label: "Yellow" },
  { id: "pink",   bg: "#fce8e8", border: "#f08080", text: "#8b1a1a", label: "Pink"   },
  { id: "green",  bg: "#e6f4ea", border: "#5cb85c", text: "#1a5c1a", label: "Green"  },
  { id: "blue",   bg: "#e8f0fe", border: "#4a90d9", text: "#1a3a6b", label: "Blue"   },
];

// ─── Render text with inline highlights ──────────────────────────────────────
function renderHighlightedText(text = "", highlights = [], onHighlightClick, onRemoveHighlight) {
  if (!highlights || highlights.length === 0) return text;
  const sorted = [...highlights].sort((a, b) => b.text.length - a.text.length);
  const escaped = sorted.map((h) => h.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const match = sorted.find((h) => h.text.toLowerCase() === part.toLowerCase());
    if (match) {
      const col = HIGHLIGHT_COLORS.find((c) => c.id === match.color) || HIGHLIGHT_COLORS[0];
      return (
        <mark
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            if (match.isNote && onHighlightClick) {
              onHighlightClick(match.noteId);
            } else if (!match.isNote && onRemoveHighlight) {
              const rect = e.target.getBoundingClientRect();
              onRemoveHighlight(match.text, match.color, {
                x: rect.left + rect.width / 2,
                y: rect.top,
              });
            }
          }}
          style={{
            background: col.bg,
            color: col.text,
            padding: "1px 4px",
            borderRadius: 3,
            border: `1px solid ${col.border}`,
            fontWeight: 600,
            cursor: "pointer",
            transition: "filter 0.15s",
          }}
          onMouseEnter={(e) => { if (!match.isNote) e.currentTarget.style.filter = "brightness(0.92)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

// ─── Step 1: Floating pencil bubble ──────────────────────────────────────────
function SelectionPencil({ position, onClick, pencilRef }) {
  if (!position) return null;
  // Clamp x so the bubble doesn't go off the left/right edge
  const clampedX = Math.max(28, Math.min(position.x, window.innerWidth - 28));
  return (
    <div
      ref={pencilRef}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      style={{
        position: "fixed",
        top: position.y - 50,
        left: clampedX,
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "fadeInUp 0.18s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
        title="Highlight this text"
        style={{
          width: 40, height: 40,
          borderRadius: "50%",
          background: C.primary,
          color: "#fff",
          border: "2.5px solid rgba(255,255,255,0.18)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,38,41,0.45)",
          transition: "transform 0.15s, box-shadow 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,38,41,0.55)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,38,41,0.45)"; }}
      >
        <HighlightIcon size={17} />
      </button>
      {/* caret */}
      <div style={{
        width: 0, height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: `7px solid ${C.primary}`,
        marginTop: -1,
      }} />
    </div>
  );
}

// ─── Step 2: Highlight Color Picker Panel ────────────────────────────────────
function HighlightPickerPanel({ selectionText, position, pickerRef, onHighlight, onNote, onClose }) {
  const [selectedColor, setSelectedColor] = useState("yellow");
  const col = HIGHLIGHT_COLORS.find(c => c.id === selectedColor) || HIGHLIGHT_COLORS[0];

  // Clamp position so panel doesn't overflow screen
  const panelW = 300;
  const rawX = position.x - panelW / 2;
  const clampedLeft = Math.max(8, Math.min(rawX, window.innerWidth - panelW - 8));
  const spaceAbove = position.y - 60;
  const panelH = 220;
  const top = spaceAbove > panelH ? position.y - panelH - 12 : position.y + 14;

  const truncated = selectionText.length > 120 ? selectionText.slice(0, 120) + "…" : selectionText;

  return (
    <div
      ref={pickerRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top,
        left: clampedLeft,
        width: panelW,
        zIndex: 9999,
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,38,41,0.22), 0 2px 8px rgba(0,38,41,0.08)",
        border: `1.5px solid ${C.outlineVariant}`,
        animation: "fadeInUp 0.22s cubic-bezier(.22,1,.36,1)",
        overflow: "hidden",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        background: C.primary,
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HighlightIcon size={14} />
          <span style={{
            color: "#fff", fontFamily: "'Manrope',sans-serif",
            fontWeight: 800, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase",
          }}>Highlight</span>
        </div>
        <button
          onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "rgba(255,255,255,0.8)", cursor: "pointer",
            borderRadius: 6, padding: "3px 6px", display: "flex",
            alignItems: "center", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          <CloseIcon size={13} />
        </button>
      </div>

      {/* Selected text preview */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{
          background: col.bg,
          borderLeft: `3px solid ${col.border}`,
          borderRadius: "0 8px 8px 0",
          padding: "9px 12px",
          marginBottom: 12,
          transition: "background 0.2s, border-color 0.2s",
        }}>
          <p style={{
            margin: 0,
            fontSize: 13, lineHeight: 1.55,
            color: col.text,
            fontStyle: "italic",
            fontFamily: "'Georgia',serif",
          }}>
            "{truncated}"
          </p>
        </div>

        {/* Color swatches */}
        <div style={{ marginBottom: 12 }}>
          <p style={{
            margin: "0 0 8px",
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
            color: C.outline, textTransform: "uppercase",
            fontFamily: "'Manrope',sans-serif",
          }}>Choose color</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.id}
                onMouseDown={(e) => { e.stopPropagation(); setSelectedColor(c.id); }}
                title={c.label}
                style={{
                  width: selectedColor === c.id ? 32 : 26,
                  height: selectedColor === c.id ? 32 : 26,
                  borderRadius: "50%",
                  background: c.bg,
                  border: `2.5px solid ${selectedColor === c.id ? c.border : "transparent"}`,
                  cursor: "pointer",
                  boxShadow: selectedColor === c.id ? `0 0 0 2px ${c.border}40` : `inset 0 0 0 1.5px ${c.border}`,
                  transition: "all 0.18s",
                  flexShrink: 0,
                }}
              />
            ))}
            <span style={{
              marginLeft: 4, fontSize: 12, fontWeight: 600,
              color: col.text, fontFamily: "'Manrope',sans-serif",
              background: col.bg, padding: "2px 8px",
              borderRadius: 20, border: `1px solid ${col.border}`,
            }}>{col.label}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        padding: "0 16px 14px",
        display: "flex", gap: 8,
      }}>
        <button
          onMouseDown={(e) => { e.stopPropagation(); onHighlight(selectedColor); }}
          style={{
            flex: 1,
            background: `linear-gradient(135deg,${C.accent} 0%,${C.primaryMid} 100%)`,
            color: "#fff", border: "none", borderRadius: 9,
            padding: "10px 0", cursor: "pointer",
            fontWeight: 700, fontSize: 13,
            fontFamily: "'Manrope',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            boxShadow: "0 4px 14px rgba(26,107,112,0.28)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          <HighlightIcon size={13} /> Highlight
        </button>
        <button
          onMouseDown={(e) => { e.stopPropagation(); onNote(); }}
          title="Add a note for this selection"
          style={{
            background: C.accentLight, color: C.accent,
            border: `1.5px solid ${C.accent}30`,
            borderRadius: 9, padding: "10px 13px",
            cursor: "pointer", fontWeight: 700, fontSize: 12,
            fontFamily: "'Manrope',sans-serif",
            display: "flex", alignItems: "center", gap: 4,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#d4eced"}
          onMouseLeave={(e) => e.currentTarget.style.background = C.accentLight}
        >
          <NoteIcon size={13} /> Note
        </button>
      </div>
    </div>
  );
}

// ─── Remove Highlight Popup ─────────────────────────────────────────────────────
function RemoveHighlightPopup({ info, removeRef, onRemove, onClose }) {
  if (!info) return null;
  const col = HIGHLIGHT_COLORS.find(c => c.id === info.color) || HIGHLIGHT_COLORS[0];
  const panelW = 260;
  const clampedLeft = Math.max(8, Math.min(info.position.x - panelW / 2, window.innerWidth - panelW - 8));
  const spaceAbove = info.position.y - 50;
  const top = spaceAbove > 120 ? info.position.y - 120 : info.position.y + 10;
  const truncated = info.text.length > 80 ? info.text.slice(0, 80) + "…" : info.text;

  return (
    <div
      ref={removeRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top,
        left: clampedLeft,
        width: panelW,
        zIndex: 9999,
        background: "#ffffff",
        borderRadius: 14,
        boxShadow: "0 10px 36px rgba(0,38,41,0.20), 0 2px 8px rgba(0,38,41,0.07)",
        border: `1.5px solid ${C.outlineVariant}`,
        animation: "fadeInUp 0.2s cubic-bezier(.22,1,.36,1)",
        overflow: "hidden",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {/* Coloured top strip */}
      <div style={{ height: 4, background: col.border }} />

      <div style={{ padding: "12px 14px" }}>
        {/* Highlighted text preview */}
        <div style={{
          background: col.bg,
          borderLeft: `3px solid ${col.border}`,
          borderRadius: "0 7px 7px 0",
          padding: "7px 10px",
          marginBottom: 12,
        }}>
          <p style={{
            margin: 0, fontSize: 12.5, lineHeight: 1.5,
            color: col.text, fontStyle: "italic",
            fontFamily: "'Georgia',serif",
          }}>
            "{truncated}"
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              flex: 1,
              background: "linear-gradient(135deg,#e05a5a 0%,#c0392b 100%)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "9px 0", cursor: "pointer",
              fontWeight: 700, fontSize: 12.5,
              fontFamily: "'Manrope',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              boxShadow: "0 3px 10px rgba(224,90,90,0.30)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <TrashIcon size={13} /> Remove Highlight
          </button>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              background: "#f5f7fa", color: C.onVariant,
              border: `1.5px solid ${C.outlineVariant}`,
              borderRadius: 8, padding: "9px 12px",
              cursor: "pointer", fontWeight: 600, fontSize: 12,
              fontFamily: "'Manrope',sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#eaedf0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f5f7fa"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to calculate page number based on selection index
const getPageNumber = (selectedText, content) => {
  if (!selectedText || !content) return 1;
  const idx = content.toLowerCase().indexOf(selectedText.toLowerCase());
  if (idx === -1) return 1;
  return Math.floor(idx / 900) + 1; // 900 characters per page
};

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, index, onDelete, chapterContent }) {
  const [hover, setHover] = useState(false);
  const col = HIGHLIGHT_COLORS.find(c => c.id === note.color) || HIGHLIGHT_COLORS[0];
  const pageNum = getPageNumber(note.selectedText, chapterContent);

  return (
    <div
      id={`note-card-${note._id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.noteCardBg,
        borderRadius: 12,
        padding: "14px",
        border: `1.5px solid ${hover ? C.accent : C.outlineVariant}`,
        position: "relative",
        animation: "fadeInUp 0.3s ease both",
        animationDelay: `${index * 0.04}s`,
        transition: "all 0.22s ease",
        boxShadow: hover ? "0 6px 20px rgba(0,38,41,0.08)" : "none",
      }}
    >
      {/* Header with dot & page */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: note.selectedText ? col.border : C.outline,
          marginRight: 6
        }} />
        <span style={{
          fontSize: 11, fontWeight: 800,
          color: C.outline, fontFamily: "'Manrope',sans-serif",
          letterSpacing: 0.5
        }}>
          {note.selectedText ? `PAGE ${pageNum}` : "GENERAL NOTE"}
        </span>
      </div>

      {note.selectedText && (
        <p style={{
          margin: "0 0 8px",
          fontSize: 13, lineHeight: 1.5,
          color: col.text,
          fontStyle: "italic",
          fontFamily: "'Inter',sans-serif",
          borderLeft: `2.5px solid ${col.border}`,
          paddingLeft: 8,
        }}>
          "{note.selectedText}"
        </p>
      )}

      {/* Note content bubble */}
      <div style={{
        background: note.selectedText ? "#f3f4f6" : "transparent",
        borderRadius: 8,
        padding: note.selectedText ? "8px 12px" : "0px",
        marginBottom: 8,
      }}>
        <p style={{
          margin: 0,
          fontSize: 13.5, lineHeight: 1.6,
          color: C.onSurface,
          fontFamily: "'Inter',sans-serif",
          whiteSpace: "pre-wrap",
        }}>
          {note.noteText}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.outline, fontFamily: "'Manrope',sans-serif" }}>
          {note.createdAt ? new Date(note.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : ""}
        </span>
        <button
          onClick={() => onDelete(note._id)}
          title="Delete note"
          style={{
            background: "transparent", border: "none",
            color: hover ? "#e05a5a" : C.outline,
            cursor: "pointer", padding: "3px 6px",
            borderRadius: 6, transition: "color 0.18s",
            display: "flex", alignItems: "center", gap: 3,
            fontSize: 11, fontFamily: "'Manrope',sans-serif",
          }}
        >
          <TrashIcon size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

function HighlightCard({ highlight, index }) {
  const col = HIGHLIGHT_COLORS.find((c) => c.id === highlight.color) || HIGHLIGHT_COLORS[0];
  return (
    <div
      style={{
        background: col.bg,
        borderRadius: 10,
        padding: "11px 14px",
        border: `1.5px solid ${col.border}`,
        animation: "fadeInUp 0.3s ease both",
        animationDelay: `${index * 0.04}s`,
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", left: 0, top: 8, bottom: 8,
        width: 3, borderRadius: "0 3px 3px 0",
        background: col.border,
      }} />
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.6,
        color: col.text, fontStyle: "italic",
        fontFamily: "'Inter',sans-serif", paddingLeft: 10,
      }}>
        "{highlight.text}"
      </p>
    </div>
  );
}

// ─── Study Guide Panel ────────────────────────────────────────────────────────
function StudyGuidePanel({
  chapter,
  bookId,
  highlights,
  onAddNote,
  onDeleteNote,
  notes,
  isLoading,
  onClose,
  isMobile,
  tab,
  setTab,
  noteSelection,
  setNoteSelection,
  onRemoveHighlight,
}) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setAdding(true);
    await onAddNote(text.trim());
    setText("");
    setAdding(false);
  };

  const chapterContent = chapter?.chapter_content || chapter?.content || chapter?.context || "";

  return (
    <div
      style={{
        width: isMobile ? "100%" : 320,
        minWidth: isMobile ? "100%" : 280,
        maxWidth: isMobile ? "100%" : 360,
        display: "flex",
        flexDirection: "column",
        background: C.panelBg,
        borderLeft: isMobile ? "none" : `1.5px solid ${C.outlineVariant}`,
        borderTop: isMobile ? `1.5px solid ${C.outlineVariant}` : "none",
        height: isMobile ? "auto" : "100%",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: "14px 16px 0",
        background: C.headerBg,
        borderBottom: `1px solid ${C.outlineVariant}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{
            fontFamily: "'Manrope',sans-serif", fontWeight: 800,
            fontSize: 13, color: C.primary, letterSpacing: 0.5, textTransform: "uppercase",
          }}>
            Study Guide
          </span>
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "none",
                color: C.onVariant, cursor: "pointer",
                padding: 4, borderRadius: 6,
              }}
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {["notes", "highlights"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: "transparent", border: "none",
                borderBottom: `2.5px solid ${tab === t ? C.accent : "transparent"}`,
                color: tab === t ? C.accent : C.onVariant,
                fontFamily: "'Manrope',sans-serif", fontWeight: 700,
                fontSize: 12, letterSpacing: 0.3,
                textTransform: "uppercase", cursor: "pointer",
                padding: "8px 4px",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              {t === "notes" ? `Notes (${notes.length})` : `Highlights (${highlights.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {tab === "notes" ? (
          isLoading ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{
                width: 28, height: 28, border: `3px solid ${C.accent}`,
                borderTopColor: "transparent", borderRadius: "50%",
                margin: "0 auto 10px", animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: 13, color: C.onVariant, margin: 0, fontFamily: "'Manrope',sans-serif" }}>
                Loading notes…
              </p>
            </div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 16px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: `${C.accent}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", color: C.accent,
              }}>
                <NoteIcon size={22} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.primary, margin: "0 0 4px", fontFamily: "'Manrope',sans-serif" }}>
                No notes yet
              </p>
              <p style={{ fontSize: 12, color: C.outline, margin: 0 }}>
                Select text and click "Note" or write below
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {notes.map((note, i) => (
                <NoteCard
                  key={note._id || i}
                  note={note}
                  index={i}
                  onDelete={onDeleteNote}
                  chapterContent={chapterContent}
                />
              ))}
            </div>
          )
        ) : (
          highlights.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 16px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: `${C.highlight1}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", color: C.highlight1Text,
              }}>
                <HighlightIcon size={20} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.primary, margin: "0 0 4px", fontFamily: "'Manrope',sans-serif" }}>
                No highlights yet
              </p>
              <p style={{ fontSize: 12, color: C.outline, margin: 0 }}>
                Select text in the chapter to highlight it
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {highlights.map((hl, i) => (
                <HighlightCard
                  key={i}
                  highlight={hl}
                  index={i}
                  onRemove={(text, color) => onRemoveHighlight && onRemoveHighlight(text, color)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Add note footer */}
      {tab === "notes" && (
        <div style={{
          padding: "10px 14px 14px",
          borderTop: `1px solid ${C.outlineVariant}`,
          background: C.headerBg,
          flexShrink: 0,
        }}>
          {noteSelection && (
            <div style={{
              background: C.noteCardBg,
              borderRadius: 10,
              padding: "10px 12px",
              border: `1.5px solid ${HIGHLIGHT_COLORS.find(c => c.id === noteSelection.color)?.border || C.noteAccent}`,
              marginBottom: 10,
              position: "relative",
            }}>
              <button
                onClick={() => setNoteSelection(null)}
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: C.outline,
                }}
              >
                <CloseIcon size={14} />
              </button>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.outline, textTransform: "uppercase", marginBottom: 4 }}>
                Adding Note for:
              </div>
              <p style={{
                margin: 0, fontSize: 12, fontStyle: "italic",
                color: HIGHLIGHT_COLORS.find(c => c.id === noteSelection.color)?.text || C.onSurface,
                lineHeight: 1.4,
                maxHeight: 60, overflowY: "auto",
              }}>
                "{noteSelection.text}"
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.outline }}>Color:</span>
                {HIGHLIGHT_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setNoteSelection(prev => ({ ...prev, color: col.id }))}
                    style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: col.bg, border: `1.5px solid ${noteSelection.color === col.id ? C.primary : col.border}`,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <textarea
            placeholder={noteSelection ? "Write a note for this selection..." : "Write a note…"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }}
            rows={3}
            style={{
              width: "100%", borderRadius: 8,
              border: `1.5px solid ${C.outlineVariant}`,
              padding: "9px 11px", fontSize: 13,
              fontFamily: "'Inter',sans-serif", resize: "none",
              boxSizing: "border-box", color: C.onSurface,
              outline: "none", background: "#fff",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.outlineVariant)}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !text.trim()}
            style={{
              marginTop: 8, width: "100%",
              background: text.trim()
                ? `linear-gradient(135deg,${C.accent} 0%,${C.primaryMid} 100%)`
                : C.outlineVariant,
              color: text.trim() ? "#fff" : C.outline,
              border: "none", cursor: text.trim() ? "pointer" : "not-allowed",
              borderRadius: 8, padding: "9px 0",
              fontWeight: 700, fontSize: 13,
              fontFamily: "'Manrope',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
              boxShadow: text.trim() ? "0 4px 12px rgba(26,107,112,0.25)" : "none",
            }}
          >
            <PlusIcon size={13} />
            {adding ? "Saving…" : "Add Note"}
          </button>
          <p style={{ fontSize: 10, color: C.outline, margin: "5px 0 0", textAlign: "center" }}>
            Ctrl+Enter to save
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Chapter content renderer ─────────────────────────────────────────────────
function ChapterContent({ chapter, highlights, onTextSelect, onHighlightClick, activeTheme }) {
  const contentRef = useRef(null);

  const content = chapter?.chapter_content || chapter?.content || chapter?.context || "";
  const paragraphs = content
    ? content.split(/\n{2,}/).filter(Boolean)
    : [
        "This chapter's content is not available yet. The author is still working on adding the reading material.",
        "In the meantime, you can still add notes and highlights for this chapter using the study guide panel on the right.",
        "Once the content is added, your notes and highlights will appear inline alongside the reading material.",
      ];

  // NOTE: selection detection is now handled at the document level in the main Notes component.
  // We just need userSelect:text here so text can be selected.
  return (
    <div ref={contentRef} style={{ userSelect: "text" }}>
      {/* Chapter heading */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p style={{
          fontFamily: "'Manrope',sans-serif",
          fontSize: 11, letterSpacing: 3,
          color: activeTheme.subtext, textTransform: "uppercase",
          margin: "0 0 8px", fontWeight: 700,
        }}>
          Chapter {chapter?.chapter_number || ""}
        </p>
        <h1 style={{
          fontFamily: "'Georgia',serif",
          fontSize: "clamp(26px,4vw,38px)",
          fontWeight: 700, color: activeTheme.text,
          margin: 0, lineHeight: 1.2, letterSpacing: "-0.5px",
        }}>
          {chapter?.chapter_title || chapter?.title || "Untitled Chapter"}
        </h1>
        <div style={{
          width: 40, height: 3, background: C.accent,
          borderRadius: 2, margin: "14px auto 0",
        }} />
      </div>

      {/* Paragraphs */}
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            fontFamily: "'Georgia',serif",
            fontSize: "clamp(15px,1.6vw,17px)",
            lineHeight: 1.9,
            color: activeTheme.text,
            marginBottom: "1.5rem",
            textAlign: "justify",
            textIndent: i === 0 ? 0 : "1.5em",
          }}
        >
          {/* Drop cap on first paragraph */}
          {i === 0 && para.length > 0 ? (
            <>
              <span style={{
                float: "left",
                fontSize: "clamp(52px,8vw,72px)",
                lineHeight: 0.78,
                fontFamily: "'Georgia',serif",
                fontWeight: 700,
                color: activeTheme.text,
                marginRight: 8,
                marginTop: 6,
              }}>
                {para[0]}
              </span>
              {renderHighlightedText(para.slice(1), highlights, onHighlightClick)}
            </>
          ) : (
            renderHighlightedText(para, highlights, onHighlightClick)
          )}
        </p>
      ))}
    </div>
  );
}

// ─── Main Notes Page ───────────────────────────────────────────────────────────
export default function Notes() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { id, chapterId } = useParams(); // /books/:id/chapters/:chapterId/notes

  const chapters   = useSelector((s) => s.chapter?.chaptersData || []);
  const books      = useSelector((s) => s.books?.booksData || []);
  const notes      = useSelector((s) => s.notes?.notesData || []);
  const isLoading  = useSelector((s) => s.notes?.isLoading);

  const book    = books.find((b) => b._id === id);
  const chapter = chapters.find((c) => c._id === chapterId) || null;

  // chapter navigation
  const chapterIdx   = chapters.findIndex((c) => c._id === chapterId);
  const prevChapter  = chapters[chapterIdx - 1] || null;
  const nextChapter  = chapters[chapterIdx + 1] || null;

  // highlights (stored in localStorage per chapterId)
  const [highlights, setHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem(`hl_${chapterId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Step-1 pencil bubble state: { text, position }
  const [toolbar, setToolbar] = useState(null);
  // Step-2 color picker state: { text, position }
  const [highlightPicker, setHighlightPicker] = useState(null);

  // panel visibility on mobile
  const [panelOpen, setPanelOpen] = useState(false);

  // font size
  const [fontSize, setFontSize] = useState(16);

  // theme selector
  const [theme, setTheme] = useState("cream");

  const activeTheme = theme === "white" ? {
    pageBg: "#f8f9fa",
    readerBg: "#ffffff",
    text: "#1a1f1f",
    panelBg: "#ffffff",
    accentLight: "#e8f4f5",
    border: "#d1dce0",
    subtext: "#4a5568",
    headerBg: "#f5f7fa",
  } : theme === "dark" ? {
    pageBg: "#0f172a",
    readerBg: "#1e293b",
    text: "#f1f5f9",
    panelBg: "#1e293b",
    accentLight: "#334155",
    border: "#475569",
    subtext: "#94a3b8",
    headerBg: "#0f172a",
  } : {
    pageBg: "#f4eedb",
    readerBg: "#fdf6e3",
    text: "#2c2c2c",
    panelBg: "#ffffff",
    accentLight: "#fcf8ed",
    border: "#e2d9c2",
    subtext: "#5c5c5c",
    headerBg: "#faf6eb",
  };

  // active tab state (lifted up)
  const [activeTab, setActiveTab] = useState("notes");

  // note selection details
  const [noteSelection, setNoteSelection] = useState(null);

  useEffect(() => {
    if (id) { dispatch(getChaptersByBook(id)); }
    if (books.length === 0) dispatch(getAllBooks());
  }, [id, dispatch]);

  useEffect(() => {
    if (chapterId && id) {
      dispatch(clearNotes());
      dispatch(getNotesByBookAndChapter({ bookId: id, chapterId }));
    }
  }, [chapterId, id, dispatch]);

  // persist highlights
  useEffect(() => {
    localStorage.setItem(`hl_${chapterId}`, JSON.stringify(highlights));
  }, [highlights, chapterId]);

  // Refs for pencil bubble and color picker (to skip dismiss when clicking inside)
  const pencilRef         = useRef(null);
  const pickerRef         = useRef(null);
  // Flag: skip the very next mouseup/touchend after pencil is clicked
  const pendingPickerOpen = useRef(false);

  // ── Document-level mouseup: show pencil bubble when text is selected
  useEffect(() => {
    const getSelectionInfo = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
      const selectedText = selection.toString().trim();
      if (selectedText.length < 3) return null;
      try {
        const range = selection.getRangeAt(0);
        const rect  = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;
        return {
          text: selectedText,
          position: { x: rect.left + rect.width / 2, y: rect.top },
        };
      } catch { return null; }
    };

    const handleDocMouseUp = (e) => {
      // ignore clicks inside pencil bubble or color picker
      if (pencilRef.current && pencilRef.current.contains(e.target)) return;
      if (pickerRef.current && pickerRef.current.contains(e.target)) return;

      // Pencil was just clicked → this mouseup is from that same click.
      // Don't interfere — the picker is opening.
      if (pendingPickerOpen.current) {
        pendingPickerOpen.current = false;
        return;
      }

      setTimeout(() => {
        const info = getSelectionInfo();
        if (info) {
          setToolbar(info);          // show pencil
          setHighlightPicker(null);  // hide picker if open from a previous selection
        } else {
          setToolbar(null);
        }
      }, 10);
    };

    const handleDocTouchEnd = () => {
      if (pendingPickerOpen.current) {
        pendingPickerOpen.current = false;
        return;
      }
      setTimeout(() => {
        const info = getSelectionInfo();
        if (info) { setToolbar(info); setHighlightPicker(null); }
      }, 300);
    };

    // Clicking outside pencil & picker clears both
    const handleDismiss = (e) => {
      if (pencilRef.current && pencilRef.current.contains(e.target)) return;
      if (pickerRef.current && pickerRef.current.contains(e.target)) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return; // user is still dragging a new selection
      setToolbar(null);
      setHighlightPicker(null);
    };

    document.addEventListener("mouseup",   handleDocMouseUp);
    document.addEventListener("touchend",  handleDocTouchEnd);
    document.addEventListener("mousedown", handleDismiss);
    return () => {
      document.removeEventListener("mouseup",   handleDocMouseUp);
      document.removeEventListener("touchend",  handleDocTouchEnd);
      document.removeEventListener("mousedown", handleDismiss);
    };
  }, []);

  const handleTextSelect = () => {}; // kept as no-op; detection is document-level now

  // Pencil clicked → set flag to skip next mouseup, then open color picker
  const handlePencilClick = () => {
    if (!toolbar) return;
    pendingPickerOpen.current = true;  // ← tells handleDocMouseUp to skip next event
    setHighlightPicker({ text: toolbar.text, position: toolbar.position });
    setToolbar(null);
  };

  const handleHighlight = (colorId) => {
    const src = highlightPicker || toolbar;
    if (!src) return;
    const already = highlights.find(h => h.text.toLowerCase() === src.text.toLowerCase() && h.color === colorId);
    if (already) { toast.error("Already highlighted!"); setHighlightPicker(null); setToolbar(null); return; }
    setHighlights(prev => [...prev, { text: src.text, color: colorId }]);
    toast.success("✨ Highlighted!");
    window.getSelection()?.removeAllRanges();
    setHighlightPicker(null);
    setToolbar(null);
  };

  const handleNoteFromSelection = () => {
    const src = highlightPicker || toolbar;
    if (src) {
      setNoteSelection({ text: src.text, color: "yellow" });
      setActiveTab("notes");
      setPanelOpen(true);
    }
    setToolbar(null);
    setHighlightPicker(null);
  };

  const handleAddNote = async (text) => {
    if (!chapterId || !id) return;
    await dispatch(createNote({
      book: id,
      chapter: chapterId,
      noteText: text,
      selectedText: noteSelection ? noteSelection.text : "",
      color: noteSelection ? noteSelection.color : ""
    }));
    setNoteSelection(null);
    dispatch(getNotesByBookAndChapter({ bookId: id, chapterId }));
  };

  const handleDeleteNote = async (noteId) => {
    await dispatch(deleteNote(noteId));
  };

  const handleHighlightClick = (noteId) => {
    setActiveTab("notes");
    setPanelOpen(true);
    setTimeout(() => {
      const el = document.getElementById(`note-card-${noteId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.borderColor = C.accent;
        el.style.boxShadow = "0 0 12px rgba(26,107,112,0.4)";
        setTimeout(() => {
          el.style.borderColor = "";
          el.style.boxShadow = "";
        }, 2000);
      }
    }, 100);
  };

  const navigateChapter = (ch) => {
    navigate(`/books/${id}/chapters/${ch._id}/notes`);
  };

  // Merge highlights
  const allHighlights = [
    ...highlights,
    ...notes
      .filter((n) => n.selectedText)
      .map((n) => ({
        text: n.selectedText,
        color: n.color || "yellow",
        isNote: true,
        noteId: n._id,
      })),
  ];

  if (!chapter && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: activeTheme.pageBg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Manrope',sans-serif", color: activeTheme.text, fontSize: 16 }}>Chapter not found.</p>
          <button onClick={() => navigate(`/books/${id}/chapters`)} style={{ marginTop: 12, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: activeTheme.pageBg, color: activeTheme.text, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin      { to   { transform: rotate(360deg); } }
        @keyframes fadeInUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp   { from { transform:translateY(100%); } to { transform:translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${activeTheme.border}; border-radius: 99px; }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .notes-layout { flex-direction: column !important; overflow: auto !important; max-height: none !important; }
          .reader-panel { max-width: 100% !important; overflow-y: visible !important; }
          .desktop-study-panel { display: none !important; }
          .mobile-panel-toggle { display: flex !important; }
          .mobile-overlay { display: flex !important; }
          .theme-controller {
            position: static !important;
            flex-direction: row !important;
            margin: 12px auto !important;
            width: fit-content !important;
            border-radius: 30px !important;
            padding: 8px 14px !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important;
          }
          .reader-content { padding: 24px 16px 32px !important; }
        }

        /* ── Tablet (769px – 1024px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .mobile-panel-toggle { display: none !important; }
          .desktop-study-panel { display: flex !important; width: 280px !important; min-width: 260px !important; }
          .mobile-overlay { display: none !important; }
          .theme-controller {
            position: absolute !important;
            left: 10px !important;
            top: 30px !important;
            flex-direction: column !important;
          }
          .reader-content { padding: 40px 60px 40px 60px !important; }
        }

        /* ── Desktop (>1024px) ── */
        @media (min-width: 1025px) {
          .mobile-panel-toggle { display: none !important; }
          .desktop-study-panel { display: flex !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: activeTheme.panelBg,
        borderBottom: `1.5px solid ${activeTheme.border}`,
        display: "flex", alignItems: "center",
        padding: "0 16px", height: 52, gap: 10, flexShrink: 0,
        boxShadow: "0 1px 8px rgba(0,38,41,0.06)",
        transition: "background 0.3s, border-color 0.3s"
      }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/books/${id}/chapters`)}
          style={{
            background: "transparent", border: "none",
            color: activeTheme.text, cursor: "pointer",
            borderRadius: 8, padding: "6px 8px",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = activeTheme.accentLight)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeftIcon size={16} />
          <span style={{ display: "none" }} className="back-label">Chapters</span>
        </button>

        {/* Book cover thumbnail + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {book?.cover_image && (
            <img
              src={book.cover_image}
              alt={book.title}
              style={{ width: 28, height: 36, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700,
              color: activeTheme.text, fontFamily: "'Manrope',sans-serif",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {book?.title || "Book"}
            </p>
            {chapter && (
              <p style={{
                margin: 0, fontSize: 11,
                color: activeTheme.subtext, fontFamily: "'Manrope',sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {chapter.chapter_title || chapter.title || `Chapter ${chapter.chapter_number}`}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {chapters.length > 0 && (
          <div style={{
            flex: 2, maxWidth: 180,
            height: 4, background: activeTheme.border,
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${((chapterIdx + 1) / chapters.length) * 100}%`,
              background: C.accent,
              borderRadius: 2,
              transition: "width 0.5s ease",
            }} />
          </div>
        )}

        {/* Mobile / Tablet study guide toggle */}
        <button
          className="mobile-panel-toggle"
          onClick={() => setPanelOpen((v) => !v)}
          style={{
            background: panelOpen ? activeTheme.accentLight : "transparent",
            border: `1.5px solid ${panelOpen ? C.accent : activeTheme.border}`,
            color: panelOpen ? C.accent : activeTheme.text,
            cursor: "pointer", borderRadius: 8, padding: "6px 10px",
            display: "none", alignItems: "center", gap: 5,
            fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 12,
            transition: "all 0.2s",
          }}
        >
          <BookOpenIcon size={15} /> Study Guide
        </button>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div
        className="notes-layout"
        style={{
          flex: 1, display: "flex",
          overflow: "hidden",
          maxHeight: "calc(100vh - 52px)",
        }}
      >
        {/* ── Left: Reader panel ───────────────────────────────────────────── */}
        <div
          className="reader-panel"
          style={{
            flex: 1, overflowY: "auto",
            background: activeTheme.readerBg,
            position: "relative",
            transition: "background 0.3s",
            minWidth: 0,
          }}
        >
          {/* Theme & Font Controller */}
          <div style={{
            position: "absolute",
            left: 20,
            top: 40,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "12px 8px",
            background: activeTheme.panelBg,
            borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: `1.5px solid ${activeTheme.border}`,
            alignItems: "center",
            zIndex: 100,
            transition: "background 0.3s, border-color 0.3s"
          }}
            className="theme-controller"
          >
            {/* White Theme */}
            <button
              onClick={() => setTheme("white")}
              title="White Theme"
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#ffffff", border: `2px solid ${theme === "white" ? C.accent : "#d1dce0"}`,
                cursor: "pointer", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            />
            {/* Cream Theme */}
            <button
              onClick={() => setTheme("cream")}
              title="Cream Theme"
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#f4eedb", border: `2px solid ${theme === "cream" ? C.accent : "#d1dce0"}`,
                cursor: "pointer", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            />
            {/* Dark Theme */}
            <button
              onClick={() => setTheme("dark")}
              title="Dark Theme"
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#0f172a", border: `2px solid ${theme === "dark" ? C.accent : "#475569"}`,
                cursor: "pointer", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
              }}
            />
            
            <div style={{ width: 16, height: 1, background: activeTheme.border, margin: "4px 0" }} />
            
            {/* Font sizing buttons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <button
                onClick={() => setFontSize((f) => Math.min(24, f + 1))}
                title="Increase Font Size"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: activeTheme.text, padding: "2px 4px", fontSize: 13, fontWeight: 800,
                  fontFamily: "'Manrope',sans-serif"
                }}
              >A+</button>
              <button
                onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                title="Decrease Font Size"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: activeTheme.text, padding: "2px 4px", fontSize: 13, fontWeight: 800,
                  fontFamily: "'Manrope',sans-serif"
                }}
              >A-</button>
            </div>
          </div>

          <div
            className="reader-content"
            style={{
              maxWidth: 680, margin: "0 auto",
              padding: "clamp(28px,5vw,60px) clamp(56px,7vw,80px)",
              fontSize,
            }}
          >
            {!chapter ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontFamily: "'Manrope',sans-serif", color: activeTheme.text, fontSize: 14 }}>Loading chapter…</p>
              </div>
            ) : (
              <ChapterContent
                chapter={chapter}
                highlights={allHighlights}
                onTextSelect={handleTextSelect}
                onHighlightClick={handleHighlightClick}
                activeTheme={activeTheme}
              />
            )}

            {/* ── Chapter navigation ───────────────────────────────────────── */}
            <div style={{
              marginTop: 52, paddingTop: 24,
              borderTop: `1.5px solid ${activeTheme.border}`,
              display: "flex", justifyContent: "space-between", gap: 12,
              transition: "border-color 0.3s"
            }}>
              {prevChapter ? (
                <button
                  onClick={() => navigateChapter(prevChapter)}
                  style={{
                    background: activeTheme.panelBg,
                    border: `1.5px solid ${activeTheme.border}`,
                    borderRadius: 10, padding: "12px 18px",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 8,
                    fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13,
                    color: activeTheme.text, transition: "all 0.2s",
                    flex: 1, maxWidth: "48%",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = activeTheme.accentLight; e.currentTarget.style.borderColor = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = activeTheme.panelBg; e.currentTarget.style.borderColor = activeTheme.border; }}
                >
                  <ChevronLeftIcon size={16} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: activeTheme.subtext, marginBottom: 2 }}>Previous</div>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {prevChapter.chapter_title || prevChapter.title || `Chapter ${prevChapter.chapter_number}`}
                    </div>
                  </div>
                </button>
              ) : <div style={{ flex: 1 }} />}

              {nextChapter ? (
                <button
                  onClick={() => navigateChapter(nextChapter)}
                  style={{
                    background: activeTheme.panelBg,
                    border: `1.5px solid ${activeTheme.border}`,
                    borderRadius: 10, padding: "12px 18px",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "flex-end", gap: 8,
                    fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13,
                    color: activeTheme.text, transition: "all 0.2s",
                    flex: 1, maxWidth: "48%", textAlign: "right",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = activeTheme.accentLight; e.currentTarget.style.borderColor = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = activeTheme.panelBg; e.currentTarget.style.borderColor = activeTheme.border; }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: activeTheme.subtext, marginBottom: 2 }}>Next</div>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {nextChapter.chapter_title || nextChapter.title || `Chapter ${nextChapter.chapter_number}`}
                    </div>
                  </div>
                  <ChevronRightIcon size={16} />
                </button>
              ) : <div style={{ flex: 1 }} />}
            </div>
          </div>
        </div>

        {/* ── Right: Study Guide panel (desktop + tablet) ───────────────────── */}
        <div
          className="desktop-study-panel"
          style={{
            display: "flex",
            flexShrink: 0,
          }}
        >
          <StudyGuidePanel
            chapter={chapter}
            bookId={id}
            highlights={highlights}
            notes={notes}
            isLoading={isLoading}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onClose={() => setPanelOpen(false)}
            isMobile={false}
            tab={activeTab}
            setTab={setActiveTab}
            noteSelection={noteSelection}
            setNoteSelection={setNoteSelection}
          />
        </div>
      </div>

      {/* Mobile Study Guide drawer (shown only on ≤768px via CSS) */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,38,41,0.5)",
          backdropFilter: "blur(4px)",
          display: "none", // hidden by default; CSS shows it on mobile when panelOpen
          alignItems: "flex-end",
          pointerEvents: panelOpen ? "auto" : "none",
          opacity: panelOpen ? 1 : 0,
          transition: "opacity 0.25s",
        }}
        className="mobile-overlay"
        onClick={() => setPanelOpen(false)}
      >
        <div
          style={{
            width: "100%",
            background: activeTheme.panelBg,
            borderRadius: "18px 18px 0 0",
            maxHeight: "82vh",
            display: "flex", flexDirection: "column",
            transform: panelOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s cubic-bezier(.22,1,.36,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <StudyGuidePanel
            chapter={chapter}
            bookId={id}
            highlights={highlights}
            notes={notes}
            isLoading={isLoading}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onClose={() => setPanelOpen(false)}
            isMobile={true}
            tab={activeTab}
            setTab={setActiveTab}
            noteSelection={noteSelection}
            setNoteSelection={setNoteSelection}
          />
        </div>
      </div>

      {/* ── Step 1: Pencil bubble ──────────────────────────────────────────────── */}
      {toolbar && !highlightPicker && (
        <SelectionPencil
          position={toolbar.position}
          onClick={handlePencilClick}
          pencilRef={pencilRef}
        />
      )}

      {/* ── Step 2: Color picker panel ────────────────────────────────────────── */}
      {highlightPicker && (
        <HighlightPickerPanel
          selectionText={highlightPicker.text}
          position={highlightPicker.position}
          pickerRef={pickerRef}
          onHighlight={handleHighlight}
          onNote={handleNoteFromSelection}
          onClose={() => { setHighlightPicker(null); window.getSelection()?.removeAllRanges(); }}
        />
      )}
    </div>
  );
}
