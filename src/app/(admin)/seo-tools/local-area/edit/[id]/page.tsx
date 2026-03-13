'use client'

import api from "@/lib/api"
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"

export default function StateEdit() {

    const router = useRouter()
    const params = useParams()
    const id = params?.id ?? ""
    const searchParams = useSearchParams()
    const cityId = searchParams.get("city_id")

    const fileRef = useRef<HTMLInputElement | null>(null)

    const [name, setName] = useState("")
    const [meta_title, set_meta_title] = useState("")
    const [meta_description, set_meta_description] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState("")
    const [removeImage, setRemoveImage] = useState(false)
    const [loading, setLoading] = useState(false)

    /* ================= GET LOCAL AREA ================= */

    async function getStateDetail() {

        try {

            const formData = new FormData()
            formData.append("area_id", id as string)

            const res = await api.post('/Wb/local_area_detail', formData)

            if (res.data.status == 0) {

                const state = res.data.data

                setName(state.name)
                set_meta_title(state.meta_title)
                set_meta_description(state.meta_description)
                setDescription(state.description)
                setPreview(state.img)

            }

        } catch (error) {

            toast.error("Failed to load local area details")

        }

    }

    useEffect(() => {

        if (id) {
            getStateDetail()
        }

    }, [id])

    /* ================= IMAGE CHANGE ================= */

    function handleImageChange(e: any) {

        const file = e.target.files[0]

        if (file) {

            setImage(file)
            setPreview(URL.createObjectURL(file))
            setRemoveImage(false)

        }

    }

    /* ================= REMOVE IMAGE ================= */

    function handleRemoveImage() {

        setPreview("")
        setImage(null)
        setRemoveImage(true)

        if (fileRef.current) {
            fileRef.current.value = ""
        }

    }

    /* ================= UPDATE LOCAL AREA ================= */

    async function handleUpdate() {

        if (!name) {

            toast.error("Name required")
            return

        }

        try {

            setLoading(true)

            const formData = new FormData()

            formData.append("area_id", id as string)

            if (cityId) {
                formData.append("city_id", cityId)
            }

            formData.append("name", name)
            formData.append("meta_title", meta_title)
            formData.append("meta_description", meta_description)
            formData.append("description", description)

            if (image) {
                formData.append("image", image)
            }

            if (removeImage) {
                formData.append("remove_image", "1")
            }

            const res = await api.post('/Wb/update_local_area', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            if (res.data.status == 0) {

                toast.success("Local area updated successfully")
                router.push("/seo-tools/local-area")

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

                <h2 className="text-2xl font-semibold">Edit Local Area</h2>

                <button
                    onClick={() => router.back()}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                    ← Back
                </button>

            </div>

            {/* NAME */}

            <div>

                <label className="block mb-2 text-gray-300">Local Area Name</label>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter area name"
                />

            </div>

            {/* META TITLE */}

            <div>

                <label className="block mb-2 text-gray-300">Meta Title</label>

                <input
                    type="text"
                    value={meta_title}
                    onChange={(e) => set_meta_title(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />

            </div>

            {/* META DESCRIPTION */}

            <div>

                <label className="block mb-2 text-gray-300">Meta Description</label>

                <input
                    type="text"
                    value={meta_description}
                    onChange={(e) => set_meta_description(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />

            </div>

            {/* IMAGE */}

            <div>

                <label className="block mb-2 text-gray-300">Area Image</label>

                {preview && (

                    <div className="relative w-32 mb-4">

                        <img
                            src={preview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                        />

                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                        >
                            Delete
                        </button>

                    </div>

                )}

                <input
                    type="file"
                    ref={fileRef}
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
                {loading ? "Updating..." : "Update Local Area"}
            </button>

        </div>

    )

}