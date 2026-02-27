'use client'
import React, { useEffect, useRef, useState } from "react"

type Props = {
  description?: string
  onChange?: (value: string) => void
}

export default function TextEditor({ description = "", onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== description) {
      editorRef.current.innerHTML = description || ""
    }
  }, [description])

  const emitChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const focusEditor = () => editorRef.current?.focus()

  const format = (cmd: string, value?: string) => {
    focusEditor()
    document.execCommand(cmd, false, value)
    emitChange()
  }

  // 🔥 HEADING WITH SIZE FIX
  const setHeading = (tag: "h1" | "h2" | "h3") => {
    focusEditor()
    document.execCommand("formatBlock", false, tag)

    // force size
    if (tag === "h1") document.execCommand("fontSize", false, "6")
    if (tag === "h2") document.execCommand("fontSize", false, "5")
    if (tag === "h3") document.execCommand("fontSize", false, "4")

    emitChange()
  }

  const addLink = () => {
    if (!url) return
    format("createLink", url)
    setUrl("")
    setShowLinkInput(false)
  }

  return (
    <div className="w-full border border-gray-700 rounded-xl bg-[#0f172a] shadow-lg">

      {/* ===== TOOLBAR ===== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-700 p-3 bg-[#020617] rounded-t-xl">

        {/* Headings */}
        <button onClick={() => setHeading("h1")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm">H1</button>

        <button onClick={() => setHeading("h2")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm">H2</button>

        <button onClick={() => setHeading("h3")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white text-sm">H3</button>

        {/* Bold */}
        <button onClick={() => format("bold")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold">B</button>

        {/* Alignment */}
        <button onClick={() => format("justifyLeft")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white">L</button>

        <button onClick={() => format("justifyCenter")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white">C</button>

        <button onClick={() => format("justifyRight")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white">R</button>

        <button onClick={() => format("justifyFull")}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white">J</button>

        {/* Colors */}
        <button onClick={() => format("foreColor", "#ffffff")} className="w-6 h-6 rounded bg-white border"/>
        <button onClick={() => format("foreColor", "#ef4444")} className="w-6 h-6 rounded bg-red-500"/>
        <button onClick={() => format("foreColor", "#f97316")} className="w-6 h-6 rounded bg-orange-500"/>
        <button onClick={() => format("foreColor", "#eab308")} className="w-6 h-6 rounded bg-yellow-400"/>
        <button onClick={() => format("foreColor", "#22c55e")} className="w-6 h-6 rounded bg-green-500"/>

        {/* Link */}
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white"
        >
          🔗
        </button>
      </div>

      {/* ===== LINK INPUT ===== */}
      {showLinkInput && (
        <div className="flex gap-2 p-3 border-b border-gray-700 bg-[#020617]">
          <input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded w-full outline-none"
          />
          <button
            onClick={addLink}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      )}

      {/* ===== EDITOR ===== */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onClick={focusEditor}
        className="min-h-[240px] p-4 outline-none text-white bg-[#0f172a] cursor-text"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  )
}