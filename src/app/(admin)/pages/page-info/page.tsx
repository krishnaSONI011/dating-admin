'use client'
import api from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function Pages(){

    const [pages , setPagesData] = useState<any[]>([])
    const [loading , setLoading] = useState(false)
    const router = useRouter()

    // ================= GET PAGES =================
    async function getPages(){
        try{
            const res = await api.post(`/Wb/pages`)
            if(res.data.status === 0){
                setPagesData(res.data.data.pages || [])
            }
        }catch(e){
            console.log(e)
            toast.error("Failed to fetch pages")
        }
    }

    useEffect(()=>{
        getPages()
    },[])

    // ================= DELETE PAGE =================
    async function handleDelete(id:string){
        if(!confirm("Are you sure you want to delete this page?")) return

        try{
            setLoading(true)

            // 🔥 Replace this API
            const formData = new FormData()
            formData.append('page_id' , id)
            const res = await api.post(`/Wb/delete_pages`, formData)

            if(res.data.status === 0){
                toast.success("Page deleted")
                getPages() // refresh
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

            {/* ================= TOP HEADER ================= */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Pages</h1>

                <button
                    onClick={()=>router.push("/pages/add")}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                    + Add Page
                </button>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-700 text-left">

                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-3 border border-gray-700">Category</th>
                            <th className="p-3 border border-gray-700">Page Title</th>
                            <th className="p-3 border border-gray-700">Location Target</th>
                            <th className="p-3 border border-gray-700 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4 text-gray-400">
                                    No pages found
                                </td>
                            </tr>
                        ) : (
                            pages.map((item:any)=>(
                                <tr key={item.id} className="hover:bg-gray-900">

                                    <td className="p-3 border border-gray-700">
                                        {item.cat_slug}
                                    </td>

                                    <td className="p-3 border border-gray-700">
                                        {item.title}
                                    </td>

                                    <td className="p-3 border border-gray-700">
                                        {item.city_slug || "-"}
                                    </td>

                                    <td className="p-3 border border-gray-700 text-center space-x-2">

                                        <button
                                            onClick={()=>router.push(`/pages/page-info/edit/${item.slug}`)}
                                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={()=>handleDelete(item.id)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

        </div>
    )
}