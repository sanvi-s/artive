import { useRef, useEffect, useCallback, useState } from "react";
import { sanitizeHtml } from "@/utils/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type ActiveFormats = { bold: boolean; italic: boolean; cursive: boolean };

function getActiveFormats(): ActiveFormats {
  const bold = document.queryCommandState("bold");
  const italic = document.queryCommandState("italic");

  const sel = window.getSelection();
  let cursive = false;
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.classList?.contains("cursive-text")) { cursive = true; break; }
      }
      node = node.parentNode;
    }
  } else if (sel && sel.anchorNode) {
    let node: Node | null = sel.anchorNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.classList?.contains("cursive-text")) { cursive = true; break; }
      }
      node = node.parentNode;
    }
  }

  return { bold, italic, cursive };
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
  minHeight = "140px",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [active, setActive] = useState<ActiveFormats>({ bold: false, italic: false, cursive: false });

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, []);

  const emit = useCallback(() => {
    const raw = editorRef.current?.innerHTML || "";
    onChange(sanitizeHtml(raw));
    setActive(getActiveFormats());
  }, [onChange]);

  const applyBold = () => {
    editorRef.current?.focus();
    document.execCommand("bold", false);
    emit();
  };

  const applyItalic = () => {
    editorRef.current?.focus();
    document.execCommand("italic", false);
    emit();
  };

  const applyCursive = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // Check if selection is already inside a cursive span — if so, unwrap it
    let ancestor: Node | null = range.commonAncestorContainer;
    while (ancestor && ancestor !== editorRef.current) {
      if (ancestor.nodeType === Node.ELEMENT_NODE && (ancestor as Element).classList?.contains("cursive-text")) {
        // Unwrap: replace span with its children
        const parent = ancestor.parentNode!;
        while (ancestor.firstChild) parent.insertBefore(ancestor.firstChild, ancestor);
        parent.removeChild(ancestor);
        emit();
        return;
      }
      ancestor = ancestor.parentNode;
    }

    if (range.collapsed) return;

    try {
      const span = document.createElement("span");
      span.className = "cursive-text";
      range.surroundContents(span);
    } catch {
      const frag = range.extractContents();
      const span = document.createElement("span");
      span.className = "cursive-text";
      span.appendChild(frag);
      range.insertNode(span);
    }

    sel.removeAllRanges();
    emit();
  };

  const toolbarBtn = (
    label: string,
    title: string,
    isActive: boolean,
    onPress: () => void,
    extraStyle?: React.CSSProperties
  ) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onPress(); }}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-all ${
        isActive
          ? "bg-accent-1/20 text-accent-1 ring-1 ring-accent-1/40"
          : "text-foreground/50 hover:text-foreground hover:bg-foreground/8"
      }`}
      style={extraStyle}
    >
      {label}
    </button>
  );

  return (
    <div className={`rich-editor-wrap rounded-lg border border-border overflow-hidden focus-within:ring-1 focus-within:ring-accent-1/30 focus-within:border-accent-1/40 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-border/60 bg-background/40">
        {toolbarBtn("B", "Bold", active.bold, applyBold, { fontWeight: 700 })}
        {toolbarBtn("I", "Italic", active.italic, applyItalic, { fontStyle: "italic" })}
        {toolbarBtn("C", "Cursive", active.cursive, applyCursive, { fontFamily: "'Caveat', cursive", fontSize: "15px", fontWeight: 600 })}
        <div className="w-px h-4 bg-border/60 mx-1" />
        <span className="text-[10px] text-muted-foreground/50 select-none">
          Select text then tap B / I / C
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyUp={() => setActive(getActiveFormats())}
        onMouseUp={() => setActive(getActiveFormats())}
        onSelect={() => setActive(getActiveFormats())}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Always insert <br> so Chrome never creates stray <div> wrappers
            document.execCommand('insertLineBreak');
            emit();
          }
        }}
        data-placeholder={placeholder}
        className="rich-editor px-4 py-3 text-sm font-serif focus:outline-none text-foreground/90 leading-7"
        style={{ minHeight, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />
    </div>
  );
};
