'use client'
import TextEditor from "@/components/TextEditor"
import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

interface CategoryItem {
  id: number
  name: string
  meta_title?: string
  meta_description?: string
  keyword?: string
  description?: string  //  Added
}

interface FormState {
  name: string
  meta_title: string
  meta_description: string
  keyword: string
  description: string  //  Added
}

const emptyForm: FormState = {
  name: "",
  meta_title: "",
  meta_description: "",
  keyword: "",
  description: "",  //  Added
}

export default function Category() {

  const [category, setCategory] = useState<CategoryItem[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  // ================= GET CATEGORY =================
  async function getCategory() {
    try {
      const res = await api.post('/Wb/posts_categories')
      if (res.data.status == 0) {
        setCategory(res.data.data ?? [])
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      console.log(e)
      toast.error("Failed to fetch categories")
    }
  }

  useEffect(() => {
    getCategory()
  }, [])

  // ================= HANDLE INPUT =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ================= ADD CATEGORY =================
  async function handleAddCategory() {
    if (!form.name.trim()) return toast.error("Category name required")

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('meta_title', form.meta_title)
      formData.append('meta_description', form.meta_description)
      formData.append('keyword', form.keyword)
      formData.append('description', form.description)  // ✅ Added

      const res = await api.post('/Wb/add_posts_category', formData)

      if (res.data.status === 0) {
        toast.success("Category added")
        setForm(emptyForm)
        getCategory()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error("Add failed")
    } finally {
      setLoading(false)
    }
  }

  // ================= EDIT CATEGORY =================
  function handleEditClick(item: CategoryItem) {
    setEditId(item.id)
    setForm({
      name: item.name ?? "",
      meta_title: item.meta_title ?? "",
      meta_description: item.meta_description ?? "",
      keyword: item.keyword ?? "",
      description: item.description ?? "",  // ✅ Added
    })
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  }

  async function handleUpdateCategory() {
    if (!form.name.trim()) return toast.error("Category name required")

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('cat_id', String(editId))
      formData.append('name', form.name)
      formData.append('meta_title', form.meta_title)
      formData.append('meta_description', form.meta_description)
      formData.append('keyword', form.keyword)
      formData.append('description', form.description)  // ✅ Added

      const res = await api.post('/Wb/update_posts_category', formData)

      if (res.data.status === 0) {
        toast.success("Category updated")
        setForm(emptyForm)
        setEditId(null)
        getCategory()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error("Update failed")
    } finally {
      setLoading(false)
    }
  }

  function handleCancelEdit() {
    setEditId(null)
    setForm(emptyForm)
  }

  // ================= DELETE CATEGORY =================
  async function handleDeleteCategory(id: number) {
    if (!confirm("Are you sure you want to delete?")) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('cat_id', String(id))

      const res = await api.post('/Wb/delete_posts_category', formData)

      if (res.data.status === 0) {
        toast.success("Category deleted")
        getCategory()
      } else {
        toast.error(res.data.message)
      }
    } catch (e) {
      toast.error("Delete failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6 text-white bg-[#020617]">

      <h1 className="text-2xl font-semibold">Category</h1>

      {/* ================= CATEGORY LIST ================= */}
      <div className="space-y-3">
        {category.length === 0 ? (
          <p className="text-gray-400">No categories found</p>
        ) : (
          category.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-900 p-4 rounded-lg border transition
                ${editId === item.id ? "border-blue-500" : "border-gray-700"}`}
            >
              <div className="flex justify-between items-start gap-4">

                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-semibold">{item.name}</p>
                  {item.meta_title && (
                    <p className="text-xs text-gray-400">
                      Meta Title: <span className="text-gray-300">{item.meta_title}</span>
                    </p>
                  )}
                  {item.meta_description && (
                    <p className="text-xs text-gray-400 truncate">
                      Meta Desc: <span className="text-gray-300">{item.meta_description}</span>
                    </p>
                  )}
                  {item.keyword && (
                    <p className="text-xs text-gray-400">
                      Keywords: <span className="text-gray-300">{item.keyword}</span>
                    </p>
                  )}
                  {/* ✅ Show description preview */}
                  {item.description && (
                    <p
                      className="text-xs text-gray-400 truncate"
                      dangerouslySetInnerHTML={{
                        __html: "Description: " + item.description.replace(/<[^>]*>/g, ' ').slice(0, 80) + "..."
                      }}
                    />
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(item.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= ADD / EDIT FORM ================= */}
      <div className="border-t border-gray-700 pt-4 space-y-3">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {editId ? "Edit Category" : "Add Category"}
          </h2>
          {editId && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Category Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter category name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
          />
        </div>

        {/* Meta Title */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            placeholder="Enter meta title"
            value={form.meta_title}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Meta Description</label>
          <textarea
            name="meta_description"
            placeholder="Enter meta description"
            value={form.meta_description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded resize-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Keywords</label>
          <input
            type="text"
            name="keyword"
            placeholder="e.g. escorts, call girls, massage"
            value={form.keyword}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
          />
        </div>

        {/* ✅ Description with TextEditor */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Description</label>
          <TextEditor
            description={form.description}
            onChange={(value: string) => setForm(prev => ({ ...prev, description: value }))}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={editId ? handleUpdateCategory : handleAddCategory}
          disabled={loading}
          className={`px-4 py-2 rounded font-semibold transition
            ${editId
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading
            ? "Processing..."
            : editId ? "Update Category" : "Add Category"
          }
        </button>

      </div>

    </div>
  )
}