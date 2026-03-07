'use client'

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"

interface Category{
  id:string
  title:string
}

export default function CreateBlog(){

  const [categories,setCategories] = useState<Category[]>([])
  const [newCategory,setNewCategory] = useState("")

  const [form,setForm] = useState({
    cat_id:"",
    title:"",
    description:"",
    meta_title:"",
    meta_description:""
  })

  const [image,setImage] = useState<File | null>(null)

  /* ================= LOAD CATEGORY ================= */

  useEffect(()=>{
    loadCategories()
  },[])

  async function loadCategories(){
    try{

      const res = await api.post("/Wb/blogs_categories")

      if(res.data.status == "0"){
        setCategories(res.data.data)
      }

    }catch(e){
      console.log(e)
    }
  }

  /* ================= ADD CATEGORY ================= */

  async function addCategory(){

    if(!newCategory.trim()){
      toast.error("Enter category title")
      return
    }

    try{

      const fd = new FormData()
      fd.append("title",newCategory)

      const res = await api.post("/Wb/add_blogs_category",fd)

      if(res.data.status == "0"){
        toast.success("Category added")
        setNewCategory("")
        loadCategories()
      }

    }catch(e){
      console.log(e)
    }
  }

  /* ================= DELETE CATEGORY ================= */

  async function deleteCategory(id:string){

    if(!confirm("Delete category?")) return

    try{

      const fd = new FormData()
      fd.append("cat_id",id)

      const res = await api.post("/Wb/delete_blogs_category",fd)

      if(res.data.status == "0"){
        toast.success("Category deleted")
        loadCategories()
      }

    }catch(e){
      console.log(e)
    }
  }

  /* ================= HANDLE INPUT ================= */

  function handleChange(e:any){
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })
  }

  /* ================= CREATE BLOG ================= */

  async function createBlog(){

    if(!form.cat_id || !form.title){
      toast.error("Fill required fields")
      return
    }

    try{

      const fd = new FormData()

      fd.append("cat_id",form.cat_id)
      fd.append("title",form.title)
      fd.append("description",form.description)
      fd.append("meta_title",form.meta_title)
      fd.append("meta_description",form.meta_description)

      if(image){
        fd.append("img",image)
      }

      const res = await api.post(
        "/Wb/add_blogs",
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      if(res.data.status == "0"){
        toast.success("Blog created")
        setForm({
          cat_id:"",
          title:"",
          description:"",
          meta_title:"",
          meta_description:""
        })
        setImage(null)
      }

    }catch(e){
      console.log(e)
    }
  }

  return(
    <div className="p-6 text-white">

      <h1 className="text-2xl font-semibold mb-6">
        Create Blog
      </h1>

      {/* CATEGORY SECTION */}

      <div className="mb-8 border p-4 rounded-lg">

        <h2 className="text-lg mb-4">Blog Categories</h2>

        <div className="flex gap-3 mb-4">

          <input
            value={newCategory}
            onChange={(e)=>setNewCategory(e.target.value)}
            placeholder="New category title"
            className="bg-gray-800 px-3 py-2 rounded w-64"
          />

          <button
            onClick={addCategory}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Add Category
          </button>

        </div>

        <div className="flex gap-2 flex-wrap">

          {categories.map((cat)=>(
            <div key={cat.id} className="bg-gray-800 px-3 py-2 rounded flex items-center gap-2">

              {cat.title}

              <button
                onClick={()=>deleteCategory(cat.id)}
                className="text-red-400 text-xs"
              >
                delete
              </button>

            </div>
          ))}

        </div>

      </div>

      {/* BLOG FORM */}

      <div className="space-y-4">

        {/* CATEGORY */}
        <select
          name="cat_id"
          value={form.cat_id}
          onChange={handleChange}
          className="bg-gray-800 px-3 py-2 rounded w-full"
        >
          <option value="">Select Category</option>

          {categories.map((cat)=>(
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}

        </select>

        {/* TITLE */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Blog Title"
          className="bg-gray-800 px-3 py-2 rounded w-full"
        />

        {/* DESCRIPTION */}
        {/* <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Blog Description"
          rows={4}
          className="bg-gray-800 px-3 py-2 rounded w-full"
        /> */}
       {/* DESCRIPTION */}

<TextEditor
  description={form.description}
  onChange={(value)=>{
    setForm({
      ...form,
      description:value
    })
  }}
/>

        {/* META TITLE */}
        <input
          name="meta_title"
          value={form.meta_title}
          onChange={handleChange}
          placeholder="Meta Title"
          className="bg-gray-800 px-3 py-2 rounded w-full"
        />

        {/* META DESCRIPTION */}
        <textarea
          name="meta_description"
          value={form.meta_description}
          onChange={handleChange}
          placeholder="Meta Description"
          rows={3}
          className="bg-gray-800 px-3 py-2 rounded w-full"
        />

        {/* IMAGE */}
        <input
          type="file"
          onChange={(e)=>setImage(e.target.files?.[0] || null)}
          className="bg-gray-800 px-3 py-2 rounded w-full"
        />

        {/* SUBMIT */}
        <button
          onClick={createBlog}
          className="bg-blue-600 px-6 py-2 rounded"
        >
          Create Blog
        </button>

      </div>

    </div>
  )
}