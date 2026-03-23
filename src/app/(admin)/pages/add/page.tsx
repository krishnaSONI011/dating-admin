'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"
import { Label } from "recharts"
import TextArea from "@/components/form/input/TextArea"

export default function AddPages() {

    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [metaTitle , setmetaTitle] = useState('')
    const [metaDescription , setmetaDescription] = useState('')
    const [categories, setCategories] = useState<any[]>([])
    const [cities, setCities] = useState<any[]>([])
    const [keyword , setKeyword] = useState<any>('')
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const [loading, setLoading] = useState(false)

    // ================= LOAD CATEGORY =================
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
            const res = await api.post('/Wb/cities_areas') // 🔥 replace if different
            if (res.data.status == 0) {
                setCities(res.data.data)
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getCategories()
        getCities()
    }, [])

    // ================= SAVE PAGE =================
    async function handleSave() {

        if (!title || !description || !selectedCategory || !selectedCity) {
            toast.error("All fields required")
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("title", title)
            formData.append("description", description)
            formData.append("meta_title", metaTitle)
            formData.append("meta_description", metaDescription)
            formData.append("cat_slug", selectedCategory)
            formData.append("city_slug", selectedCity)
            formData.append("area_slug", "") // empty as per API
            formData.append("keyword" , keyword)

            const res = await api.post('/Wb/add_pages', formData)

            if (res.data.status == 0) {
                toast.success("Page added successfully")
                router.push("/pages/page-info")
            } else {
                toast.error(res.data.message)
            }

        } catch (e) {
            toast.error("Save failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 p-6 shadow-xl space-y-6 text-white bg-[#020617]">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Add Page</h1>

                <button
                    onClick={() => router.back()}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                    ← Back
                </button>
            </div>

            {/* ================= TITLE ================= */}
            <div>
                <label className="block mb-2 text-gray-300">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter page title"
                />
            </div>
            <div>
                <label className="block mb-2 text-gray-300">Meta Title</label>
                <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setmetaTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter page title"
                />
            </div>
            <div>
                <label className="block mb-2 text-gray-300">Meta Description</label>
                <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setmetaDescription(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter page title"
                />
                
            </div>
            <div className="mt-5">
            <label className="block mb-2 text-gray-300">Meta Keyword</label>
                <TextArea
                    name="keyword"
                    value={keyword}
                    onChange={(val) => setKeyword(val)}
                    placeholder="Keywords"
                />
            </div>

            {/* ================= CATEGORY ================= */}
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

            {/* ================= LOCATION ================= */}
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

            {/* ================= DESCRIPTION ================= */}
            <div>
                <label className="block mb-2 text-gray-300">Description</label>
                {/* <textarea
                    rows={6}
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                    placeholder="Enter page description"
                /> */}
                {/* <TextArea value={description} onChange={(e)=>setDescription(e.target.value)}/> */}
                <TextEditor
                    description={description}
                    onChange={(value) => setDescription(value)}
                />
            </div>

            {/* ================= SAVE BUTTON ================= */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
            >
                {loading ? "Saving..." : "Save Page"}
            </button>

        </div>
    )
}