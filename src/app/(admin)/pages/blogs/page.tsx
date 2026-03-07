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

export default function Blogs(){

  const [categories,setCategories] = useState<Category[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    fetchBlogs()
  },[])

  async function fetchBlogs(){
    try{

      const res = await api.post("/Wb/blogs")

      if(res.data.status == "0"){
        setCategories(res.data.data)
      }

    }catch(err){
      console.log(err)
    }finally{
      setLoading(false)
    }
  }

  /* ================= DELETE BLOG ================= */

  async function deleteBlog(id:string){

    if(!confirm("Delete this blog?")) return

    try{

      const fd = new FormData()
      fd.append("blog_id",id)

      const res = await api.post("/Wb/delete_blogs",fd)

      if(res.data.status == "0"){
        toast.success("Blog deleted")
        fetchBlogs()
      }else{
        toast.error(res.data.message)
      }

    }catch(e){
      console.log(e)
    }
  }

  if(loading){
    return (
      <div className="p-6 text-gray-500">
        Loading Blogs...
      </div>
    )
  }

  return(
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-semibold text-white">
          Blogs
        </h1>

        <Link href="/pages/blogs/create">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            + Create Blog
          </button>
        </Link>

      </div>

      <div className="overflow-x-auto border rounded-lg">

        <table className="w-full text-sm text-left">

          <thead className="text-white bg-gray-800">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Created</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {categories.map((cat)=>(

              cat.blogs.map((blog)=>(

                <tr key={blog.id} className="border-t text-white">

                  {/* IMAGE */}
                  <td className="p-3">
                    <img
                      src={`${blog.img}`}
                      alt={blog.title}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </td>

                  {/* TITLE */}
                  <td className="p-3 font-medium">
                    {blog.title}
                  </td>

                  {/* CATEGORY */}
                  <td className="p-3 text-gray-400">
                    {cat.title}
                  </td>

                  {/* SLUG */}
                  <td className="p-3 text-gray-400">
                    {blog.slug}
                  </td>

                  {/* DATE */}
                  <td className="p-3 text-gray-400">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    {blog.status === "1" ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-3 flex gap-2 justify-center items-center">

                    {/* <Link href={`/admin/blogs/edit/${blog.slug}`}>
                      <button className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded">
                        Edit
                      </button>
                    </Link> */}

                    <button
                      onClick={()=>deleteBlog(blog.id)}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}