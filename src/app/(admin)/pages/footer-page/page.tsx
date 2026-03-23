'use client'

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"

export default function FooterPage() {
  const [pagesData, setPagesData]     = useState<any[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [addingCat, setAddingCat]     = useState(false)
  const [loading, setLoading]         = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [editingPage, setEditingPage] = useState<any>(null)
  const [form, setForm] = useState({
    title:            "",
    description:      "",
    meta_title:       "",
    meta_description: "",
    keyword:          "",
    footer_cat_id:    "",
    legal_id:         "",
  })

  /* ================= LOAD DATA ================= */
  const loadPages = async () => {
    try {
      const res = await api.post("/Wb/legal_pages_by_footer_cat")
      if (res.data.status == 0) {
        // Always set — even empty array — so state is always fresh
        setPagesData(res.data.data ?? [])
      } else {
        toast.error(res.data.message || "Failed to load pages")
        setPagesData([])
      }
    } catch {
      toast.error("Server error")
      setPagesData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPages() }, [])

  /* ================= ADD CATEGORY ================= */
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("Enter category name")
    setAddingCat(true)
    try {
      const fd = new FormData()
      fd.append("name", newCategory)
      const res = await api.post("/Wb/add_footer_cat", fd)
      if (res.data.status == 0) {
        toast.success(res.data.message || "Category added")
        setNewCategory("")
        loadPages()
      } else {
        toast.error(res.data.message || "Failed to add category")
      }
    } catch {
      toast.error("Server error")
    } finally {
      setAddingCat(false)
    }
  }

  /* ================= DELETE CATEGORY ================= */
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its pages?")) return
    try {
      const fd = new FormData()
      fd.append("cat_id", id)
      const res = await api.post("/Wb/delete_footer_cat", fd)
      if (res.data.status == 0) {
        toast.success(res.data.message || "Category deleted")
        // BUG FIX: optimistically remove from local state immediately
        // so the empty state renders at once without needing a refresh
        setPagesData(prev => prev.filter(c => c.category_id !== id))
        // Also re-fetch to stay in sync with server
        loadPages()
      } else {
        toast.error(res.data.message || "Failed to delete")
      }
    } catch {
      toast.error("Server error")
    }
  }

  /* ================= MODAL HELPERS ================= */
  const emptyForm = (catId = "") => ({
    title: "", description: "", meta_title: "",
    meta_description: "", keyword: "", footer_cat_id: catId, legal_id: "",
  })

  const openCreateModal = (catId: string) => {
    setEditingPage(null)
    setForm(emptyForm(catId))
    setModalOpen(true)
  }

  const openEditModal = (page: any, catId: string) => {
    setEditingPage(page)
    setForm({
      title:            page.title            ?? "",
      description:      page.description      ?? "",
      meta_title:       page.meta_title        ?? "",
      meta_description: page.meta_description  ?? "",
      keyword:          page.keyword           ?? "",
      footer_cat_id:    catId,
      legal_id:         page.id,
    })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditingPage(null) }

  /* ================= SAVE PAGE ================= */
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim())
      return toast.error("Title and description are required")

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("title",            form.title)
      fd.append("description",      form.description)
      fd.append("meta_title",       form.meta_title)
      fd.append("meta_description", form.meta_description)
      fd.append("keyword",          form.keyword)
      fd.append("footer_cat_id",    form.footer_cat_id)
      if (editingPage) fd.append("legal_id", form.legal_id)

      const endpoint = editingPage ? "/Wb/update_legal_page" : "/Wb/add_legal_pages"
      const res = await api.post(endpoint, fd)

      if (res.data.status == 0) {
        toast.success(res.data.message || (editingPage ? "Page updated" : "Page created"))
        closeModal()
        loadPages()
      } else {
        toast.error(res.data.message || "Failed to save")
      }
    } catch {
      toast.error("Server error")
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE PAGE ================= */
  const handleDeletePage = async (id: string) => {
    if (!confirm("Delete this page?")) return
    try {
      const fd = new FormData()
      fd.append("legal_id", id)
      const res = await api.post("/Wb/delete_legal_pages", fd)
      if (res.data.status == 0) {
        toast.success(res.data.message || "Page deleted")
        loadPages()
      } else {
        toast.error(res.data.message || "Failed to delete")
      }
    } catch {
      toast.error("Server error")
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Footer Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage footer categories and their legal pages</p>
        </div>
        <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          {pagesData.length} {pagesData.length === 1 ? "category" : "categories"}
        </span>
      </div>

      {/* ── ADD CATEGORY ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Add Footer Category</h2>
        <div className="flex gap-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            placeholder="Category name (e.g. Company, Support)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleAddCategory}
            disabled={addingCat}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            {addingCat ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-700 border-t-orange-500" />
        </div>
      )}

      {/* ── EMPTY STATE — only shown when not loading and truly empty ── */}
      {!loading && pagesData.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-800 py-16 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <p className="text-white font-medium">No categories yet</p>
          <p className="text-sm text-gray-500">Add a footer category above to get started.</p>
        </div>
      )}

      {/* ── CATEGORIES + PAGES ── */}
      {!loading && pagesData.map((cat) => (
        <div key={cat.category_id} className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">

          {/* Category Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-800 bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <h2 className="font-semibold text-white">{cat.category_name}</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                {(cat.pages ?? []).length} pages
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openCreateModal(cat.category_id)}
                className="inline-flex items-center gap-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Page
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.category_id)}
                className="inline-flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                </svg>
                Delete Category
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="p-5">
            {(cat.pages ?? []).length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-600">No pages in this category yet.</p>
                <button onClick={() => openCreateModal(cat.category_id)} className="mt-2 text-xs text-orange-500 hover:text-orange-400 underline underline-offset-2">
                  Add the first page
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(cat.pages ?? []).map((page: any) => (
                  <div key={page.id} className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-colors flex flex-col">
                    <h3 className="font-medium text-white text-sm mb-1 truncate">{page.title}</h3>
                    {page.meta_title && (
                      <p className="text-xs text-orange-400/80 truncate mb-1">{page.meta_title}</p>
                    )}
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                      {page.description?.replace(/<[^>]+>/g, '') || ""}
                    </p>
                    {page.keyword && (
                      <p className="text-xs text-gray-600 truncate mb-3">🔑 {page.keyword}</p>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => openEditModal(page, cat.category_id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-gray-900 border border-gray-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingPage ? "Edit Page" : "Create Page"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingPage ? "Update the page content and SEO fields" : "Fill in the page content and SEO details"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">* Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Page title"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Description — TextEditor */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">* Description</label>
                <TextEditor
                  description={form.description}
                  onChange={(val) => setForm(prev => ({ ...prev, description: val }))}
                />
              </div>

              {/* SEO Fields row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meta Title</label>
                  <input
                    value={form.meta_title}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO meta title"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Keywords</label>
                  <input
                    value={form.keyword}
                    onChange={(e) => setForm(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder="keyword1, keyword2, ..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meta Description</label>
                <textarea
                  rows={3}
                  value={form.meta_description}
                  onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO meta description (150–160 chars recommended)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
                <p className="mt-1 text-xs text-gray-600">{form.meta_description.length} / 160 chars</p>
              </div>

            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/60 shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingPage ? "Update Page" : "Create Page"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}