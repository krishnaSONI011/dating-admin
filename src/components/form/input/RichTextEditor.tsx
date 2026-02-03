"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Label from "@/components/form/Label";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Write here…",
  className = "",
  disabled = false,
  label,
  minHeight = "120px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalRef = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalRef.current) {
      isInternalRef.current = false;
      return;
    }
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el || !onChange) return;
    isInternalRef.current = true;
    onChange(el.innerHTML);
  }, [onChange]);

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) execCmd("createLink", url);
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="rounded p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Bold"
            disabled={disabled}
          >
            <span className="font-bold text-sm">B</span>
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="rounded p-2 italic text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Italic"
            disabled={disabled}
          >
            <span className="text-sm">I</span>
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="rounded p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 underline"
            title="Underline"
            disabled={disabled}
          >
            <span className="text-sm">U</span>
          </button>
          <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
          <button
            type="button"
            onClick={addLink}
            className="rounded p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Insert link"
            disabled={disabled}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="rounded p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Bullet list"
            disabled={disabled}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="rounded p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Numbered list"
            disabled={disabled}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h9v9H5V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          data-placeholder={placeholder}
          className="min-w-0 p-3 text-sm text-gray-800 dark:text-white/90 focus:outline-none dark:bg-gray-900 [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-gray-400 dark:[&:empty::before]:text-gray-500"
          style={{ minHeight }}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
