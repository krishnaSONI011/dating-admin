'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function ColorField({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (val: string) => void
}) {
    return (
        <div>
            <label className="block mb-2 text-gray-300">{label}</label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value || "#000000"}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-gray-700"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded w-40 text-sm"
                />
                <div
                    className="w-10 h-10 rounded border border-gray-700"
                    style={{ backgroundColor: value || "transparent" }}
                />
            </div>
        </div>
    )
}

export default function SiteSetting() {

    const [title, setTitle] = useState("")
    const [primaryColor, setPrimaryColor] = useState("")
    const [secondColor, setSecondColor] = useState("")
    const [websiteBackground, setWebsiteBackground] = useState("")
    const [textColor, setTextColor] = useState("")
    const [navbarColor, setNavbarColor] = useState("")
    const [contentBorderColor, setContentBorderColor] = useState("")
    const [websiteText, setWebsiteText] = useState("")
    const [listingBoxBackground, setListingBoxBackground] = useState("")
    const [listingBoxSuperColor, setListingBoxSuperColor] = useState("")
    const [listingBoxHighlightColor, setListingBoxHighlightColor] = useState("")
    const [logo, setLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState("")
    const [removeLogo, setRemoveLogo] = useState(false) // ✅ track removal
    const [loading, setLoading] = useState(false)

    const WEB_ID = "1"

    const isSuccess = (res: any) => String(res?.data?.status) === "0"

    async function getSetting() {
        try {
            const formData = new FormData()
            formData.append("web_id", WEB_ID)
            const res = await api.post("/Wb/websetting_detail", formData)

            if (isSuccess(res)) {
                const data = res.data.data
                setTitle(data.title || "")
                setPrimaryColor(data.primary_color || "")
                setSecondColor(data.second_color || "")
                setWebsiteBackground(data.website_background || "")
                setTextColor(data.text_color || "")
                setNavbarColor(data.navbar_color || "")
                setContentBorderColor(data.content_border_color || "")
                setWebsiteText(data.webiste_text || "")
                setListingBoxBackground(data.listing_box_background_color || "")
                setListingBoxSuperColor(data.listing_box_super_color || "")
                setListingBoxHighlightColor(data.listing_box_highlight_color || "")
                setLogoPreview(data.logo || "")
                setRemoveLogo(false) // ✅ reset on reload
                setLogo(null)
            }
        } catch (err) {
            toast.error("Failed to load settings")
        }
    }

    useEffect(() => {
        getSetting()
    }, [])

    function handleLogoChange(e: any) {
        const file = e.target.files[0]
        if (file) {
            setLogo(file)
            setLogoPreview(URL.createObjectURL(file))
            setRemoveLogo(false) //  cancel removal if new file selected
        }
    }

    //  Delete logo
    function handleDeleteLogo() {
        setLogoPreview("")
        setLogo(null)
        setRemoveLogo(true)
    }

    async function handleUpdate() {
        try {
            setLoading(true)

            const formData = new FormData()
            formData.append("web_id", WEB_ID)
            formData.append("title", title)
            formData.append("primary_color", primaryColor)
            formData.append("second_color", secondColor)
            formData.append("website_background", websiteBackground)
            formData.append("text_color", textColor)
            formData.append("navbar_color", navbarColor)
            formData.append("content_border_color", contentBorderColor)
            formData.append("webiste_text", websiteText)
            formData.append("listing_box_background_color", listingBoxBackground)
            formData.append("listing_box_super_color", listingBoxSuperColor)
            formData.append("listing_box_highlight_color", listingBoxHighlightColor)

            if (logo) {
                formData.append("logo", logo)         
            } else if (removeLogo) {
                formData.append("remove_image", "1")  
            }

            const res = await api.post("/Wb/update_websetting", formData)

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

            {/* ===== GENERAL COLORS ===== */}
            <div className="border border-gray-700 rounded-xl p-4 space-y-5">
                <h3 className="text-lg font-semibold text-gray-200">General Colors</h3>
                <ColorField label="Primary Color"        value={primaryColor}       onChange={setPrimaryColor} />
                <ColorField label="Secondary Color"      value={secondColor}        onChange={setSecondColor} />
                <ColorField label="Website Background"   value={websiteBackground}  onChange={setWebsiteBackground} />
                <ColorField label="Navbar Color"         value={navbarColor}        onChange={setNavbarColor} />
                <ColorField label="Content Border Color" value={contentBorderColor} onChange={setContentBorderColor} />
                <ColorField label="Text Color"           value={textColor}          onChange={setTextColor} />
                <ColorField label="Website Text Color"   value={websiteText}        onChange={setWebsiteText} />
            </div>

            {/* ===== LISTING BOX COLORS ===== */}
            <div className="border border-gray-700 rounded-xl p-4 space-y-5">
                <h3 className="text-lg font-semibold text-gray-200">Listing Box Colors</h3>
                <ColorField label="Listing Box Background"      value={listingBoxBackground}      onChange={setListingBoxBackground} />
                <ColorField label="Listing Box Super Top Color" value={listingBoxSuperColor}       onChange={setListingBoxSuperColor} />
                <ColorField label="Listing Box Highlight Color" value={listingBoxHighlightColor}   onChange={setListingBoxHighlightColor} />
            </div>

            {/* ===== LOGO ===== */}
            <div>
                <label className="block mb-2 text-gray-300">Website Logo</label>

                {/* ✅ Show preview + delete button */}
                {logoPreview && !removeLogo && (
                    <div className="mb-4 space-y-2">
                        <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-32 h-32 object-contain border border-gray-700 rounded"
                        />
                        <button
                            type="button"
                            onClick={handleDeleteLogo}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg transition"
                        >
                            Delete
                        </button>
                    </div>
                )}

                {/* ✅ Show removed notice */}
                {removeLogo && !logoPreview && (
                    <p className="text-sm text-red-400 mb-3">
                        Logo will be removed when you save.
                    </p>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
                />
            </div>

            {/* SAVE */}
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
            >
                {loading ? "Updating..." : "Update Settings"}
            </button>

        </div>
    )
}