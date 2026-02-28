'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function SiteSetting() {

    const [title, setTitle] = useState("")
    const [primaryColor, setPrimaryColor] = useState("")
    const [secondColor, setSecondColor] = useState("")
    const [logo, setLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState("")
    const [loading, setLoading] = useState(false)

    const WEB_ID = "1"

    const isSuccess = (res: any) =>
        String(res?.data?.status) === "0"

    // ================= LOAD DETAILS =================
    async function getSetting() {
        try {
            const formData = new FormData()
            formData.append("web_id", WEB_ID)

            const res = await api.post(
                "/Wb/websetting_detail",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )

            if (isSuccess(res)) {
                const data = res.data.data

                setTitle(data.title || "")
                setPrimaryColor(data.primary_color || "")
                setSecondColor(data.second_color || "")
                setLogoPreview(data.logo || "")
            }

        } catch (err) {
            toast.error("Failed to load settings")
        }
    }

    useEffect(() => {
        getSetting()
    }, [])

    // ================= HANDLE LOGO =================
    function handleLogoChange(e: any) {
        const file = e.target.files[0]
        if (file) {
            setLogo(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    // ================= UPDATE =================
    async function handleUpdate() {

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("web_id", WEB_ID)
            formData.append("title", title)
            formData.append("primary_color", primaryColor)
            formData.append("second_color", secondColor)

            if (logo) {
                formData.append("logo", logo)
            }

            const res = await api.post(
                "/Wb/update_websetting",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )

            if (isSuccess(res)) {
                toast.success("Website setting updated successfully")
                getSetting()
            } else {
                toast.error(res?.data?.message || "Update failed")
            }

        } catch (err) {
            toast.error("Update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white space-y-6">

            <h2 className="text-2xl font-semibold">Website Settings</h2>

            {/* TITLE */}
            <div>
                <label className="block mb-2 text-gray-300">Website Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />
            </div>

            {/* PRIMARY COLOR */}
            <div>
                <label className="block mb-2 text-gray-300">Primary Color</label>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                />
            </div>

            {/* SECOND COLOR */}
            <div>
                <label className="block mb-2 text-gray-300">Secondary Color</label>
                <input
                    type="color"
                    value={secondColor}
                    onChange={(e) => setSecondColor(e.target.value)}
                    className="w-20 h-10"
                />
            </div>

            {/* LOGO */}
            <div>
                <label className="block mb-2 text-gray-300">Website Logo</label>

                {logoPreview && (
                    <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-32 h-32 object-contain mb-4 border border-gray-700 rounded"
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />
            </div>

            {/* SAVE BUTTON */}
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
            >
                {loading ? "Updating..." : "Update Settings"}
            </button>

        </div>
    )
}