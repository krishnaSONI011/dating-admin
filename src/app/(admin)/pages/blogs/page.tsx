'use client'

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import Link from "next/link"

interface Blog {
  id: string
  slug: string
  img: string
  title: string
  description: string
  status: string
  created_at: string
}

interface Category {
  id: string
  title: string
  blogs: Blog[]
}

export default function Blogs() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchBlogs() }, [])

  async function fetchBlogs() {
    try {
      const res = await api.post("/Wb/blogs")
      if (res.data.status == 0) setCategories(res.data.data ?? [])
    } catch (err) {
      console.log(err)
      toast.error("Failed to load blogs")
    } finally {
      setLoading(false)
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog?")) return
    setDeletingId(id)
    try {
      const fd = new FormData()
      fd.append("blog_id", id)
      const res = await api.post("/Wb/delete_blogs", fd)
      if (res.data.status == 0) {
        toast.success("Blog deleted")
        fetchBlogs()
      } else {
        toast.error(res.data.message || "Failed to delete")
      }
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

  // Flatten all blogs with their category title
  const allBlogs = categories.flatMap((cat) =>
    (cat.blogs ?? []).map((blog) => ({ ...blog, categoryTitle: cat.title }))
  )

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
          <p className="text-sm text-gray-500">Loading blogs...</p>
        </div>
      </div>
    )
  }

  /* ── MAIN ── */
  return (
    <div className="p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blogs</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {allBlogs.length} {allBlogs.length === 1 ? "post" : "posts"} across {categories.length} {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        <Link href="/pages/blogs/create">
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Blog
          </button>
        </Link>
      </div>

      {/* ── EMPTY STATE ── */}
      {allBlogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 py-20 flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">No blogs yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first blog post to get started.</p>
          </div>
          <Link href="/pages/blogs/create">
            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition-colors">
              + Create Blog
            </button>
          </Link>
        </div>
      ) : (
        /* ── TABLE ── */
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/60">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {allBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* IMAGE */}
                    <td className="px-4 py-3">
                      {blog.img ? (
                        <img
                          src={blog.img}
                          alt={blog.title}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* TITLE */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-white font-medium truncate">{blog.title}</p>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {blog.categoryTitle}
                      </span>
                    </td>

                    {/* SLUG */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-gray-400 text-xs font-mono truncate">{blog.slug}</p>
                    </td>

                    {/* DATE */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-gray-400 text-xs">
                        {new Date(blog.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      {blog.status === "1" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* EDIT */}
                        <Link href={`/pages/blogs/edit/${blog.slug}`}>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </Link>

                        {/* DELETE */}
                        <button
                          onClick={() => deleteBlog(blog.id)}
                          disabled={deletingId === blog.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
                        >
                          {deletingId === blog.id ? (
                            <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          {deletingId === blog.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}