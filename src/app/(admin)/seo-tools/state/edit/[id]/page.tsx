'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"

export default function StateEdit() {

    const router = useRouter()
    const params = useParams()
    const id = params?.id ?? ""

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState("")
    const [loading, setLoading] = useState(false)

    // ================= GET SINGLE STATE =================
    async function getStateDetail() {
        try {
            const formData = new FormData()
            formData.append("state_id", id as string)

            const res = await api.post('/Wb/state_detail', formData)

            if (res.data.status == 0) {
                const state = res.data.data

                setName(state.name)
                setDescription(state.description)
                setPreview(state.img) // existing image
            }

        } catch (error) {
            toast.error("Failed to load state details")
        }
    }

    useEffect(() => {
        if (id) {
            getStateDetail()
        }
    }, [id])

    // ================= IMAGE CHANGE =================
    function handleImageChange(e: any) {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    // ================= UPDATE STATE =================
    async function handleUpdate() {

        if (!name) {
            toast.error("State name required")
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("state_id", id as string)
            formData.append("name", name)
            formData.append("description", description)

            if (image) {
                formData.append("image", image)
            }

            const res = await api.post('/Wb/update_state', formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })

            if (res.data.status == 0) {
                toast.success("State updated successfully")
                router.push("/seo-tools/state")
            } else {
                toast.error(res.data.message)
            }

        } catch (error) {
            toast.error("Update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Edit State</h2>

                <button
                    onClick={() => router.back()}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                    ← Back
                </button>
            </div>

            {/* STATE NAME */}
            <div>
                <label className="block mb-2 text-gray-300">State Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter state name"
                />
            </div>

            {/* IMAGE */}
            <div>
                <label className="block mb-2 text-gray-300">State Image</label>

                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-700 mb-4"
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="block mb-2 text-gray-300">Description</label>
                <TextEditor
                    description={description}
                    onChange={(value) => setDescription(value)}
                />
            </div>

            {/* UPDATE BUTTON */}
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
            >
                {loading ? "Updating..." : "Update State"}
            </button>

        </div>
    )
}