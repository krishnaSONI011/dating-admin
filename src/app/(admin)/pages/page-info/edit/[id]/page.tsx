'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"

export default function EditPages() {

    const router = useRouter()
    const params = useParams()
    const id = params?.id ?? ""

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [categories, setCategories] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const [loading, setLoading] = useState(false)

    // ================= LOAD CATEGORIES =================
    async function getCategories() {
        try {
            const res = await api.post('/Wb/posts_categories')
            if (res.data.status == 0) {
                setCategories(res.data.data)
            }
        } catch (e) {
            console.log(e)
        }
    }

    // ================= LOAD CITIES =================
    async function getCities() {
        try {
            const res = await api.post('/Wb/cities_areas')
            if (res.data.status == 0) {
                setCities(res.data.data)
            }
        } catch (e) {
            console.log(e)
        }
    }

    // ================= LOAD PAGE DATA =================
    async function getPageData() {
        try {
            const formData = new FormData()
            formData.append("page_slug", id as string)

            const res = await api.post('/Wb/pages_detail', formData)

            if (res.data.status == 0) {
                const page = res.data.data

                setTitle(page.title)
                setDescription(page.description)
                setSelectedCategory(page.cat_slug)
                setSelectedCity(page.city_slug)
            }

        } catch (error) {
            toast.error("Failed to load page data")
        }
    }

    useEffect(() => {
        if (id) {
            getCategories()
            getCities()
            getPageData()
        }
    }, [id])

    // ================= UPDATE PAGE =================
    async function handleUpdate() {

        if (!title || !description || !selectedCategory || !selectedCity) {
            toast.error("All fields required")
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("id", id as string)
            formData.append("title", title)
            formData.append("description", description)
            formData.append("cat_slug", selectedCategory)
            formData.append("city_slug", selectedCity)
            formData.append("area_slug", "")

            const res = await api.post('/Wb/update_pages', formData)

            if (res.data.status == 0) {
                toast.success("Page updated successfully")
                router.push("/pages/page-info")
            } else {
                toast.error(res.data.message)
            }

        } catch (e) {
            toast.error("Update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6 text-white bg-[#020617]">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Edit Page</h1>

                <button
                    onClick={() => router.back()}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                    ← Back
                </button>
            </div>

            {/* TITLE */}
            <div>
                <label className="block mb-2 text-gray-300">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />
            </div>

            {/* CATEGORY */}
            <div>
                <label className="block mb-2 text-gray-300">Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.slug}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* CITY */}
            <div>
                <label className="block mb-2 text-gray-300">Location (City)</label>
                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                >
                    <option value="">Select City</option>
                    {cities.map((city: any) => (
                        <option key={city.id} value={city.slug}>
                            {city.name}
                        </option>
                    ))}
                </select>
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
                {loading ? "Updating..." : "Update Page"}
            </button>

        </div>
    )
}