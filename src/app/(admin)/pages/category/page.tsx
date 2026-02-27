'use client'
import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Category(){

    const [category , setCategory] = useState<any[]>([])
    const [newCategory , setNewCategory] = useState("")
    const [loading , setLoading] = useState(false)

    // ================= GET CATEGORY =================
    async function getCategory(){
        try{
            const res = await api.post('/Wb/posts_categories')

            if(res.data.status == 0){
                setCategory(res.data.data)
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            console.log(e)
            toast.error("Failed to fetch categories")
        }
    }

    useEffect(()=>{
        getCategory()
    },[])

    // ================= ADD CATEGORY =================
    async function handleAddCategory(){
        if(!newCategory.trim()){
            toast.error("Category name required")
            return
        }

        try{
            setLoading(true)

            const formData  = new FormData()
            formData.append('name', newCategory)
            const res = await api.post('/Wb/add_posts_category',formData)

            if(res.data.status === 0){
                toast.success("Category added")
                setNewCategory("")
                getCategory() // refresh list
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            toast.error("Add failed")
        }finally{
            setLoading(false)
        }
    }

    // ================= DELETE CATEGORY =================
    async function handleDeleteCategory(id:number){

        if(!confirm("Are you sure you want to delete?")) return

        try{
            setLoading(true)

            //  REPLACE THIS API
            const formData  = new FormData()
            formData.append('name', newCategory)
            const res = await api.post('/Wb/delete_posts_category',{
                cat_id:id
            })

            if(res.data.status === 0){
                toast.success("Category deleted")
                getCategory() // refresh list
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            toast.error("Delete failed")
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6 text-white bg-[#020617]">

            <h1 className="text-2xl font-semibold">Category</h1>

            {/* ================= CATEGORY LIST ================= */}
            <div className="space-y-3">
                {category.length === 0 ? (
                    <p className="text-gray-400">No categories found</p>
                ) : (
                    category.map((item:any)=>(
                        <div 
                            key={item.id}
                            className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700"
                        >
                            <span>{item.name}</span>

                            <button
                                onClick={()=>handleDeleteCategory(item.id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* ================= ADD CATEGORY ================= */}
            <div className="border-t border-gray-700 pt-4 space-y-3">

                <h2 className="text-lg font-medium">Add Category</h2>

                <input
                    type="text"
                    placeholder="Enter category name"
                    value={newCategory}
                    onChange={(e)=>setNewCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />

                <button
                    onClick={handleAddCategory}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                    {loading ? "Processing..." : "Add Category"}
                </button>

            </div>

        </div>
    )
}