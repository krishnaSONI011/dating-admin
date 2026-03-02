'use client'

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"

export default function FooterPage() {

  const [pagesData, setPagesData] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<any>(null)
  const [legalPages, setLegalPages] = useState<any[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    footer_cat_id: "",
    legal_id: ""
  })

  /* ================= LOAD DATA ================= */

  const loadPages = async () => {
    try {
      const res = await api.post("/Wb/legal_pages_by_footer_cat")

      if (res.data.status == "0") {
        setPagesData(res.data.data)
      } else {
        toast.error(res.data.message)
      }

    } catch (err) {
      toast.error("Server error")
    }
  }

  useEffect(() => {
    loadPages()
  }, [])
/* ================= LEGAL PAGES ================= */
useEffect(() => {
    async function getLegalPages() {
      try {
        const res = await api.post("/Wb/legal_pages_by_footer_cat")
  
        if (res.data.status == "0") {
          setLegalPages(res.data.data)
        }
  
      } catch (e) {
        console.log(e)
      }
    }
  
    getLegalPages()
  }, [])
  /* ================= ADD CATEGORY ================= */

  const handleAddCategory = async () => {

    if (!newCategory.trim())
      return toast.error("Enter category name")

    try {
      const fd = new FormData()
      fd.append("name", newCategory)

      const res = await api.post("/Wb/add_footer_cat", fd)

      if (res.data.status == "0") {
        toast.success(res.data.message)
        setNewCategory("")
        loadPages()
      } else {
        toast.error(res.data.message)
      }

    } catch {
      toast.error("Server error")
    }
  }

  /* ================= DELETE CATEGORY ================= */

  const handleDeleteCategory = async (id: string) => {

    if (!confirm("Delete this category?")) return

    try {
      const fd = new FormData()
      fd.append("cat_id", id)

      const res = await api.post("/Wb/delete_footer_cat", fd)

      if (res.data.status == "0") {
        toast.success(res.data.message)
        loadPages()
      } else {
        toast.error(res.data.message)
      }

    } catch {
      toast.error("Server error")
    }
  }

  /* ================= OPEN CREATE ================= */

  const openCreateModal = (catId: string) => {
    setEditingPage(null)
    setForm({
      title: "",
      description: "",
      footer_cat_id: catId,
      legal_id: ""
    })
    setModalOpen(true)
  }

  /* ================= OPEN EDIT ================= */

  const openEditModal = (page: any, catId: string) => {
    setEditingPage(page)
    setForm({
      title: page.title,
      description: page.description,
      footer_cat_id: catId,
      legal_id: page.id
    })
    setModalOpen(true)
  }

  /* ================= SAVE PAGE ================= */

  const handleSave = async () => {

    if (!form.title || !form.description)
      return toast.error("Fill all fields")

    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("description", form.description)
      fd.append("footer_cat_id", form.footer_cat_id)

      let res

      if (editingPage) {
        fd.append("legal_id", form.legal_id)
        res = await api.post("/Wb/update_legal_page", fd)
      } else {
        res = await api.post("/Wb/add_legal_pages", fd)
      }

      if (res.data.status == "0") {
        toast.success(res.data.message)
        setModalOpen(false)
        loadPages()
      } else {
        toast.error(res.data.message)
      }

    } catch {
      toast.error("Server error")
    }
  }

  /* ================= DELETE PAGE ================= */

  const handleDeletePage = async (id: string) => {

    if (!confirm("Delete this page?")) return

    try {
      const fd = new FormData()
      fd.append("legal_id", id)

      const res = await api.post("/Wb/delete_legal_pages", fd)

      if (res.data.status == "0") {
        toast.success(res.data.message)
        loadPages()
      } else {
        toast.error(res.data.message)
      }

    } catch {
      toast.error("Server error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-3xl font-bold mb-8">
        Footer Page Management
      </h1>

      {/* ================= ADD CATEGORY ================= */}
      <div className="bg-slate-900 p-6 rounded-xl border border-gray-800 mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Add Footer Category
        </h2>

        <div className="flex gap-4">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
          />

          <button
            onClick={handleAddCategory}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
          >
            Add
          </button>
        </div>

      </div>

      {/* ================= CATEGORY + PAGES ================= */}

      {pagesData.map((cat) => (

        <div
          key={cat.category_id}
          className="bg-slate-900 border border-gray-800 rounded-xl p-6 mb-8"
        >

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-semibold">
              {cat.category_name}
            </h2>

            <div className="flex gap-4">

              <button
                onClick={() => openCreateModal(cat.category_id)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
              >
                Create Page
              </button>

              <button
                onClick={() => handleDeleteCategory(cat.category_id)}
                className="text-red-500 text-sm"
              >
                Delete Category
              </button>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {cat.pages.map((page: any) => (

              <div
                key={page.id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <h3 className="font-semibold text-white mb-2">
                  {page.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {page.description}
                </p>

                <div className="flex justify-between text-sm">

                  <button
                    onClick={() => openEditModal(page, cat.category_id)}
                    className="text-blue-400"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      ))}

      {/* ================= MODAL ================= */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

          <div className="bg-slate-900 w-full max-w-2xl p-8 rounded-xl border border-gray-700">

            <h2 className="text-2xl font-semibold mb-6">
              {editingPage ? "Update Page" : "Create Page"}
            </h2>

            <div className="mb-4">
              <label className="block mb-2 text-sm">Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm">Description</label>
              <textarea
                rows={8}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex justify-end gap-4">

              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 border border-gray-600 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
              >
                {editingPage ? "Update" : "Create"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}