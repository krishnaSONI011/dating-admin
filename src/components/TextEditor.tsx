'use client'
import React, { useEffect, useRef, useState, useCallback } from "react"

type Props = {
  description?: string
  onChange?: (value: string) => void
}

/* ── Font size map ── */
const SIZES = [
  { label: "Small",  px: "12px" },
  { label: "Normal", px: "16px" },
  { label: "Large",  px: "20px" },
  { label: "XL",     px: "24px" },
  { label: "2XL",    px: "32px" },
  { label: "3XL",    px: "48px" },
]

/* ── Heading style map ── */
const BLOCK_STYLES: Record<string, { fontSize?: string; fontWeight?: string; lineHeight?: string }> = {
  h1: { fontSize: "2rem",    fontWeight: "700", lineHeight: "1.2" },
  h2: { fontSize: "1.5rem",  fontWeight: "600", lineHeight: "1.3" },
  h3: { fontSize: "1.25rem", fontWeight: "600", lineHeight: "1.4" },
  p:  {},
}

/* ── Get deepest block ancestor that is direct child of editor ── */
function getBlockAncestor(node: Node | null, editor: HTMLElement): HTMLElement | null {
  let n = node
  while (n && n !== editor) {
    if (n.nodeType === Node.ELEMENT_NODE && n.parentNode === editor) {
      return n as HTMLElement
    }
    n = n.parentNode
  }
  return null
}

/* ── Strip only browser-injected style props from a span, keep user styles ── */
function cleanSpanStyles(el: HTMLElement) {
  el.querySelectorAll<HTMLSpanElement>("span[style]").forEach(span => {
    // Remove font-weight injected by browser (not by user)
    span.style.removeProperty("font-weight")
    span.style.removeProperty("background-color")
    span.style.removeProperty("background")
    span.style.removeProperty("width")
    span.style.removeProperty("border-radius")
    span.style.removeProperty("line-height")
    span.style.removeProperty("box-sizing")
    span.style.removeProperty("background-image")
    span.style.removeProperty("background-position")
    span.style.removeProperty("background-size")
    span.style.removeProperty("background-repeat")
    span.style.removeProperty("background-attachment")
    span.style.removeProperty("background-origin")
    span.style.removeProperty("background-clip")

    // If span has no remaining styles, unwrap it
    if (!span.getAttribute("style") || span.getAttribute("style")?.trim() === "") {
      span.replaceWith(...Array.from(span.childNodes))
    }
  })
}

export default function TextEditor({ description = "", onChange }: Props) {
  const editorRef   = useRef<HTMLDivElement>(null)
  const isInternal  = useRef(false)
  const savedRange  = useRef<Range | null>(null)
  const [showLink,  setShowLink]  = useState(false)
  const [url,       setUrl]       = useState("")
  const [active,    setActive]    = useState<Set<string>>(new Set())
  const [curSize,   setCurSize]   = useState("16px")

  /* ══════════════════════════════════════════════════════════════════
     LOAD EXTERNAL CONTENT
  ══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (isInternal.current) { isInternal.current = false; return }
    if (el.innerHTML !== (description || "")) {
      el.innerHTML = description || ""
    }
  }, [description])

  /* ══════════════════════════════════════════════════════════════════
     EMIT
  ══════════════════════════════════════════════════════════════════ */
  const emit = useCallback(() => {
    if (!editorRef.current || !onChange) return
    isInternal.current = true
    onChange(editorRef.current.innerHTML)
  }, [onChange])

  /* ══════════════════════════════════════════════════════════════════
     SYNC TOOLBAR STATE (called on cursor move / key / click)
  ══════════════════════════════════════════════════════════════════ */
  const syncActive = useCallback(() => {
    const s = new Set<string>()
    try {
      if (document.queryCommandState("bold"))          s.add("bold")
      if (document.queryCommandState("italic"))        s.add("italic")
      if (document.queryCommandState("underline"))     s.add("underline")
      if (document.queryCommandState("strikeThrough")) s.add("strike")

      // Detect current block tag
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const block = getBlockAncestor(sel.anchorNode, editorRef.current!)
        if (block) s.add(block.tagName.toLowerCase())

        // Detect font-size at cursor
        let node: Node | null = sel.anchorNode
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const fs = (node as HTMLElement).style.fontSize
            if (fs) { setCurSize(fs); break }
          }
          node = node.parentNode
        }
      }
    } catch {}
    setActive(s)
  }, [])

  /* ══════════════════════════════════════════════════════════════════
     SELECTION HELPERS
  ══════════════════════════════════════════════════════════════════ */
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  const focus = () => editorRef.current?.focus()

  /* ══════════════════════════════════════════════════════════════════
     INLINE FORMAT (bold / italic / underline / strike)
     Uses execCommand only for inline — these work reliably.
  ══════════════════════════════════════════════════════════════════ */
  const execInline = (cmd: string, val?: string) => {
    focus()
    document.execCommand(cmd, false, val)
    emit()
    syncActive()
  }

  /* ══════════════════════════════════════════════════════════════════
     BLOCK FORMAT — replaces block element with clean new tag
     No execCommand("formatBlock") — we do it ourselves.
  ══════════════════════════════════════════════════════════════════ */
  const applyBlock = (tag: string) => {
    focus()
    const sel    = window.getSelection()
    const editor = editorRef.current
    if (!sel || !editor) return

    const block = getBlockAncestor(sel.anchorNode, editor)

    if (block) {
      const newEl = document.createElement(tag)

      // Apply styles directly so browser can't override via UA stylesheet
      const styles = BLOCK_STYLES[tag] || {}
      Object.entries(styles).forEach(([k, v]) => {
        ;(newEl.style as any)[k] = v
      })

      newEl.innerHTML = block.innerHTML
      block.replaceWith(newEl)

      // Strip browser-injected spans (font-weight:400 etc)
      cleanSpanStyles(newEl)

      // Place cursor at end
      const range = document.createRange()
      range.selectNodeContents(newEl)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      // Empty editor or cursor in root text node — create new block
      const newEl = document.createElement(tag)
      const styles = BLOCK_STYLES[tag] || {}
      Object.entries(styles).forEach(([k, v]) => { ;(newEl.style as any)[k] = v })
      newEl.innerHTML = "<br>"
      editor.appendChild(newEl)
      const range = document.createRange()
      range.setStart(newEl, 0)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }

    emit()
    syncActive()
  }

  /* ══════════════════════════════════════════════════════════════════
     FONT SIZE — wraps selection in <span style="font-size:...">
     Replaces the browser's <font> tag approach entirely.
  ══════════════════════════════════════════════════════════════════ */
  const applyFontSize = (px: string) => {
    setCurSize(px)
    focus()

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    if (range.collapsed) {
      // No selection — just update state for next typed characters
      // by using execCommand fontSize with a temp marker
      document.execCommand("fontSize", false, "7")
      editorRef.current?.querySelectorAll("font[size='7']").forEach(font => {
        const span = document.createElement("span")
        span.style.fontSize = px
        span.innerHTML = font.innerHTML
        font.replaceWith(span)
      })
    } else {
      // Has selection — wrap in span
      try {
        const span = document.createElement("span")
        span.style.fontSize = px
        range.surroundContents(span)
      } catch {
        // surroundContents fails if selection crosses block boundaries
        // fallback: execCommand
        document.execCommand("fontSize", false, "7")
        editorRef.current?.querySelectorAll("font[size='7']").forEach(font => {
          const span = document.createElement("span")
          span.style.fontSize = px
          span.innerHTML = font.innerHTML
          font.replaceWith(span)
        })
      }
    }

    emit()
    syncActive()
  }

  /* ══════════════════════════════════════════════════════════════════
     FONT COLOR
  ══════════════════════════════════════════════════════════════════ */
  const applyColor = (color: string) => {
    focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    if (!range.collapsed) {
      try {
        const span = document.createElement("span")
        span.style.color = color
        range.surroundContents(span)
        emit()
        syncActive()
        return
      } catch {}
    }
    // Fallback
    document.execCommand("foreColor", false, color)
    emit()
    syncActive()
  }

  /* ══════════════════════════════════════════════════════════════════
     LINK
  ══════════════════════════════════════════════════════════════════ */
  const addLink = () => {
    if (!url.trim()) return
    restoreSelection()
    focus()
    const href = url.startsWith("http") ? url : `https://${url}`
    document.execCommand("createLink", false, href)

   
    editorRef.current?.querySelectorAll("a:not([data-styled])").forEach(a => {
      a.setAttribute("target", "_blank")
      a.setAttribute("rel", "noopener noreferrer")
      a.setAttribute("data-styled", "1") 
      a.classList.add("text-(--primary-color)") 
    })

    emit()
    setUrl("")
    setShowLink(false)
    savedRange.current = null
  }

  const toggleLink = () => {
    if (!showLink) saveSelection()
    else { setUrl(""); savedRange.current = null }
    setShowLink(v => !v)
  }

  /* ══════════════════════════════════════════════════════════════════
     ENSURE first keystroke creates a <p> not a bare text node
  ══════════════════════════════════════════════════════════════════ */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const editor = editorRef.current
    if (!editor) return

    // On Enter — prevent double <br> and ensure new block is <p>
    if (e.key === "Enter") {
      e.preventDefault()
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      const range = sel.getRangeAt(0)
      range.deleteContents()

      const block = getBlockAncestor(sel.anchorNode, editor)
      const tag   = block?.tagName.toLowerCase() || "p"

      // Insert <br> if inside heading, new <p> otherwise
      if (tag.startsWith("h")) {
        // After heading, insert new <p>
        const p = document.createElement("p")
        p.innerHTML = "<br>"
        block?.insertAdjacentElement("afterend", p)
        const newRange = document.createRange()
        newRange.setStart(p, 0)
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)
      } else {
        document.execCommand("insertParagraph")
      }

      emit()
      syncActive()
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     TOOLBAR HELPERS
  ══════════════════════════════════════════════════════════════════ */
  const tb = (key?: string, extra = "") =>
    [
      "inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg",
      "text-xs font-semibold border transition-all duration-100 select-none cursor-pointer",
      key && active.has(key)
        ? "bg-orange-600 border-orange-500 text-white shadow-sm"
        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600",
      extra,
    ].filter(Boolean).join(" ")

  const sep = <div className="w-px h-5 bg-gray-700 mx-0.5 shrink-0 self-center" />
  const md  = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn() }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="w-full rounded-xl border border-gray-700 bg-gray-900 overflow-hidden shadow-lg">

      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-950 px-2.5 py-2">

        {/* Block type */}
        <button type="button" onMouseDown={md(() => applyBlock("p"))}  className={tb("p",  "")}>¶ P</button>
        <button type="button" onMouseDown={md(() => applyBlock("h1"))} className={tb("h1", "")}>H1</button>
        <button type="button" onMouseDown={md(() => applyBlock("h2"))} className={tb("h2", "")}>H2</button>
        <button type="button" onMouseDown={md(() => applyBlock("h3"))} className={tb("h3", "")}>H3</button>

        {sep}

        {/* Font size */}
        <select
          value={curSize}
          onMouseDown={e => e.stopPropagation()}
          onChange={e => applyFontSize(e.target.value)}
          className="h-8 px-2 rounded-lg text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-pointer outline-none"
        >
          {SIZES.map(s => (
            <option key={s.px} value={s.px}>{s.label} ({s.px})</option>
          ))}
        </select>

        {sep}

        {/* Inline styles */}
        <button type="button" onMouseDown={md(() => execInline("bold"))}          className={tb("bold",      "font-bold")}>B</button>
        <button type="button" onMouseDown={md(() => execInline("italic"))}        className={tb("italic",    "italic")}>I</button>
        <button type="button" onMouseDown={md(() => execInline("underline"))}     className={tb("underline", "underline")}>U</button>
        <button type="button" onMouseDown={md(() => execInline("strikeThrough"))} className={tb("strike",    "line-through")}>S</button>

        {sep}

        {/* Lists */}
        <button type="button" onMouseDown={md(() => execInline("insertUnorderedList"))} className={tb()}>• List</button>
        <button type="button" onMouseDown={md(() => execInline("insertOrderedList"))}   className={tb()}>1. List</button>

        {sep}

        {/* Alignment */}
        <button type="button" onMouseDown={md(() => execInline("justifyLeft"))}   className={tb()} title="Left">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg>
        </button>
        <button type="button" onMouseDown={md(() => execInline("justifyCenter"))} className={tb()} title="Center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>
        </button>
        <button type="button" onMouseDown={md(() => execInline("justifyRight"))}  className={tb()} title="Right">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg>
        </button>

        {sep}

        {/* Colors */}
        {([
          ["#ffffff", "bg-white",       "White"],
          ["#ef4444", "bg-red-500",     "Red"],
          ["#f97316", "bg-orange-500",  "Orange"],
          ["#eab308", "bg-yellow-400",  "Yellow"],
          ["#22c55e", "bg-green-500",   "Green"],
          ["#3b82f6", "bg-blue-500",    "Blue"],
          ["#a855f7", "bg-purple-500",  "Purple"],
        ] as const).map(([color, cls, title]) => (
          <button key={color} type="button" title={title}
            onMouseDown={md(() => applyColor(color))}
            className={`w-5 h-5 shrink-0 rounded-full border border-gray-600 hover:scale-110 hover:border-white transition-all ${cls}`}
          />
        ))}

        {sep}

        {/* Link */}
        <button type="button" onMouseDown={md(toggleLink)}
          className={`${tb()} gap-1.5 ${showLink ? "!bg-orange-600 !border-orange-500 !text-white" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          Link
        </button>

        {/* HR */}
        <button type="button" onMouseDown={md(() => { execInline("insertHorizontalRule") })} className={tb()} title="Divider">—</button>

        {sep}

        {/* Undo / Redo */}
        <button type="button" onMouseDown={md(() => execInline("undo"))} className={tb()} title="Undo">↩</button>
        <button type="button" onMouseDown={md(() => execInline("redo"))} className={tb()} title="Redo">↪</button>
      </div>

      {/* ── LINK ROW ────────────────────────────────────────────────── */}
      {showLink && (
        <div className="flex gap-2 border-b border-gray-700 bg-gray-950 px-3 py-2">
          <input autoFocus type="text" placeholder="https://example.com" value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLink()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-colors"
          />
          <button type="button" onClick={addLink}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            Insert
          </button>
          <button type="button" onClick={() => { setShowLink(false); setUrl("") }}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
            ✕
          </button>
        </div>
      )}

      {/* ── EDITOR ──────────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyDown={handleKeyDown}
        onKeyUp={syncActive}
        onMouseUp={syncActive}
        onFocus={syncActive}
        className={[
          "min-h-[220px] p-4 outline-none bg-gray-900 rounded-b-xl cursor-text text-gray-200 text-base leading-7",
          // All heading styles via Tailwind — inline styles on elements take precedence
          "[&_h1]:font-bold   [&_h1]:leading-tight [&_h1]:my-3",
          "[&_h2]:font-semibold [&_h2]:leading-snug  [&_h2]:my-2",
          "[&_h3]:font-semibold [&_h3]:leading-snug  [&_h3]:my-2",
          "[&_p]:leading-7 [&_p]:my-1 [&_p]:text-gray-200",
          "[&_ul]:list-disc    [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:text-gray-200",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:text-gray-200",
          "[&_li]:leading-7 [&_li]:my-0.5",
          "[&_a]:text-orange-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-orange-300 [&_a]:cursor-pointer",
          "[&_hr]:border-gray-700 [&_hr]:my-4",
          "[&_strong]:font-bold [&_strong]:text-white",
          "[&_em]:italic",
          "[&_s]:line-through",
        ].join(" ")}
      />
    </div>
  )
}