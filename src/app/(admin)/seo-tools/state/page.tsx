'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

export default function State() {

    const router = useRouter()
    const [states, setStates] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // ================= GET STATES =================
    async function getStates() {
        try {
            setLoading(true)
            const res = await api.post('/Wb/states')

            if (res.data.status == 0) {
                setStates(res.data.data)
            }
        } catch (error) {
            toast.error("Failed to load states")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getStates()
    }, [])

    // ================= DELETE STATE =================
    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this state?")) return
    
        try {
            const formData = new FormData()
            formData.append("state_id", id) // ✅ FIXED KEY
    
            const res = await api.post('/Wb/delete_state', formData)
    
            if (res.data.status == 0) {
                toast.success("State deleted successfully")
                getStates()
            } else {
                toast.error(res.data.message)
            }
    
        } catch (error) {
            toast.error("Delete failed")
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">States</h2>

                <button
                    onClick={() => router.push("/seo-tools/state/add")}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                    + Add State
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">

                    <thead>
                        <tr className="bg-gray-800 text-left">
                            <th className="p-3">#</th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : states.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6 text-center">
                                    No states found
                                </td>
                            </tr>
                        ) : (
                            states.map((state, index) => (
                                <tr
                                    key={state.id}
                                    className="border-b border-gray-800 hover:bg-gray-900"
                                >
                                    <td className="p-3">{index + 1}</td>

                                    {/* IMAGE */}
                                    <td className="p-3">
                                        {state.img ? (
                                            <img
                                                src={state.img}
                                                alt={state.name}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg text-xs text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </td>

                                    {/* NAME */}
                                    <td className="p-3 font-medium">
                                        {state.name}
                                    </td>

                                    {/* SLUG */}
                                    <td className="p-3 text-gray-400">
                                        {state.slug || "-"}
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-3 text-center space-x-2">
                                        <button
                                            onClick={() => router.push(`/seo-tools/state/edit/${state.id}`)}
                                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(state.id)}
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