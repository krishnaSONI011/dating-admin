'use client'

import { useEffect, useRef, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"
import { useParams, useRouter } from "next/navigation"

interface Category {
  id: string
  title: string
}

export default function CreateBlog() {
  const params  = useParams()
  const router  = useRouter()
  const slug    = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "")
  const isEdit  = Boolean(slug)

  const [categories,  setCategories]  = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [addingCat,   setAddingCat]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(isEdit)

  const [form, setForm] = useState({
    cat_id:           "",
    title:            "",
    description:      "",
    meta_title:       "",
    meta_description: "",
    keyword:          "",
    tag:              "",
  })

  const [blogId,        setBlogId]        = useState<string>("")
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [removeExisting,setRemoveExisting]= useState(false)

  const imageRef     = useRef<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /* ================= INIT ================= */
  useEffect(() => {
    loadCategories()
    if (isEdit) getBlogDetail()
  }, [])

  /* ================= LOAD CATEGORIES ================= */
  async function loadCategories() {
    try {
      const res = await api.post("/Wb/blogs_categories")
      if (res.data.status == 0) setCategories(res.data.data ?? [])
    } catch (e) {
      console.log(e)
      toast.error("Failed to load categories")
    }
  }

  /* ================= LOAD BLOG DETAIL ================= */
  async function getBlogDetail() {
    setLoadingBlog(true)
    try {
      const fd = new FormData()
      fd.append("slug", slug)
      const res = await api.post("/Wb/blogs_detail", fd)

      if (res.data.status == 0) {
        const d = res.data.data
        setBlogId(String(d.id ?? ""))
        setForm({
          cat_id:           String(d.cat_id          ?? ""),
          title:            d.title                  ?? "",
          description:      d.description            ?? "",
          meta_title:       d.meta_title              ?? "",
          meta_description: d.meta_description        ?? "",
          keyword:          d.keyword                 ?? "",
          tag:              d.tag                     ?? "",
        })
        if (d.img || d.image) setExistingImage(d.img || d.image)
      } else {
        toast.error(res.data.message || "Failed to load blog")
      }
    } catch (e) {
      console.log(e)
      toast.error("Failed to load blog")
    } finally {
      setLoadingBlog(false)
    }
  }

  /* ================= ADD CATEGORY ================= */
  async function addCategory() {
    if (!newCategory.trim()) { toast.error("Enter category title"); return }
    setAddingCat(true)
    try {
      const fd = new FormData()
      fd.append("title", newCategory)
      const res = await api.post("/Wb/add_blogs_category", fd)
      if (res.data.status == 0) {
        toast.success("Category added")
        setNewCategory("")
        loadCategories()
      } else {
        toast.error(res.data.message || "Failed to add category")
      }
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    } finally {
      setAddingCat(false)
    }
  }

  /* ================= DELETE CATEGORY ================= */
  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return
    try {
      const fd = new FormData()
      fd.append("cat_id", id)
      const res = await api.post("/Wb/delete_blogs_category", fd)
      if (res.data.status == 0) {
        toast.success("Category deleted")
        if (form.cat_id === id) setForm(prev => ({ ...prev, cat_id: "" }))
        loadCategories()
      } else {
        toast.error(res.data.message || "Failed to delete")
      }
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    }
  }

  /* ================= HANDLE INPUT ================= */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  /* ================= HANDLE IMAGE ================= */
  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    imageRef.current = file
    setPreview(URL.createObjectURL(file))
    setRemoveExisting(false)
  }

  function removeNewImage() {
    imageRef.current = null
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeExistingImageFn() {
    setExistingImage(null)
    setRemoveExisting(true)
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit() {
    if (!form.cat_id || !form.title) {
      toast.error("Category and title are required")
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("cat_id",           form.cat_id)
      fd.append("title",            form.title)
      fd.append("description",      form.description)
      fd.append("meta_title",       form.meta_title)
      fd.append("meta_description", form.meta_description)
      fd.append("keyword",          form.keyword)
      fd.append("tag",              form.tag)

      if (isEdit && blogId)  fd.append("blog_id",      blogId)
      if (removeExisting)    fd.append("remove_image",  "1")
      if (imageRef.current)  fd.append("img",           imageRef.current)

      const endpoint = isEdit ? "/Wb/update_blogs" : "/Wb/add_blogs"
      const res = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data.status == 0) {
        toast.success(isEdit ? "Blog updated successfully" : "Blog created successfully")
        if (isEdit) {
          const newImg = res.data?.data?.img || res.data?.data?.image
          if (newImg) setExistingImage(newImg)
          removeNewImage()
          setRemoveExisting(false)
        } else {
          setForm({ cat_id: "", title: "", description: "", meta_title: "", meta_description: "", keyword: "", tag: "" })
          removeNewImage()
          router.push("/blogs")
        }
      } else {
        toast.error(res.data.message || (isEdit ? "Failed to update" : "Failed to create blog"))
      }
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= LOADING STATE ================= */
  if (loadingBlog) {
    return (
      <div className="p-6 text-white flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          <p className="text-gray-400 text-sm">Loading blog...</p>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="p-6 text-white space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Blog" : "Create Blog"}
        </h1>
        {isEdit && (
          <span className="text-xs bg-blue-600/20 border border-blue-600/40 text-blue-400 px-3 py-1 rounded-full">
            Edit Mode
          </span>
        )}
      </div>

      {/* ── CATEGORY MANAGER ── */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
        <h2 className="text-lg font-medium">Blog Categories</h2>

        <div className="flex gap-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="New category title"
            className="flex-1 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-green-500"
          />
          <button
            onClick={addCategory}
            disabled={addingCat}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {addingCat ? "Adding..." : "Add"}
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-sm">
                <span>{cat.title}</span>
                <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No categories yet.</p>
        )}
      </div>

      {/* ── BLOG FORM ── */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-5">
        <h2 className="text-lg font-medium">Blog Details</h2>

        {/* Category */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">* Category</label>
          <select
            name="cat_id"
            value={form.cat_id}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">* Blog Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Blog Title"
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <TextEditor
            description={form.description}
            onChange={(value) => setForm(prev => ({ ...prev, description: value }))}
          />
        </div>

        {/* Meta Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Meta Title</label>
          <input
            name="meta_title"
            value={form.meta_title}
            onChange={handleChange}
            placeholder="Meta Title"
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Meta Description</label>
          <textarea
            name="meta_description"
            value={form.meta_description}
            onChange={handleChange}
            placeholder="Meta Description"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Keywords</label>
          <textarea
            name="keyword"
            value={form.keyword}
            onChange={handleChange}
            placeholder="Enter keywords separated by commas"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tags</label>
          <textarea
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="Enter tags separated by commas"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Blog Image</label>

          {/* Existing image — shown in edit mode until removed or replaced */}
          {existingImage && !preview && (
            <div className="relative inline-block mb-3">
              <img
                src={existingImage}
                alt="Current blog image"
                className="h-40 rounded-lg border border-gray-700 object-cover"
              />
              <span className="absolute top-1 left-1 bg-black/60 text-xs px-2 py-0.5 rounded text-gray-300">
                Current
              </span>
              <button
                onClick={removeExistingImageFn}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* New image preview */}
          {preview && (
            <div className="relative inline-block mb-3">
              <img
                src={preview}
                alt="New image preview"
                className="h-40 rounded-lg border border-blue-600 object-cover"
              />
              <span className="absolute top-1 left-1 bg-blue-600/80 text-xs px-2 py-0.5 rounded text-white">
                New
              </span>
              <button
                onClick={removeNewImage}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImage}
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm
                       file:mr-3 file:py-1 file:px-3 file:rounded file:border-0
                       file:text-xs file:font-medium file:bg-blue-600 file:text-white
                       hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          {submitting
            ? (isEdit ? "Updating..."  : "Creating...")
            : (isEdit ? "Update Blog"  : "Create Blog")}
        </button>
      </div>

    </div>
  )
}