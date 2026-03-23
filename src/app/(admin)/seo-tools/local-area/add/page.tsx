'use client'

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import TextEditor from "@/components/TextEditor";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";

export default function AddLocalArea(){
    const router = useRouter()
    const [stateData, setStateData] = useState<any[]>([])
    const fileRef = useRef<HTMLInputElement | null>(null)

    // Keep image in a ref AND state so the submit closure always sees latest value
    const imageRef = useRef<File | null>(null)
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [form, setForm] = useState({
        city_id: "",
        name: "",
        meta_title: "",
        meta_description: "",
        description: "",
        keyword: ""
    })

    /* ================= LOAD CITIES ================= */
    useEffect(() => {
        async function getCities() {
            try {
                const res = await api.post('/Wb/all_cities')
                if (res.data.status == 0) {
                    setStateData(res.data.data)
                }
            } catch {
                toast.error("Failed to load cities")
            }
        }
        getCities()
    }, [])

    /* ================= HANDLE INPUT ================= */
    function handleChange(e: any) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    /* ================= HANDLE IMAGE ================= */
    function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
        // Guard: files can be null if browser clears input
        const file = e.target.files?.[0] ?? null

        if (!file) return

        // Store in both ref (for immediate closure access) and state (for re-render)
        imageRef.current = file
        setImage(file)

        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    function removeImage() {
        imageRef.current = null
        setImage(null)
        setPreview(null)
        if (fileRef.current) {
            fileRef.current.value = ""
        }
    }

    /* ================= ADD LOCAL AREA ================= */
    async function addCity() {
        if (!form.city_id || !form.name) {
            return toast.error("Fill required fields")
        }

        try {
            const fd = new FormData()
            fd.append("city_id", form.city_id)
            fd.append("name", form.name)
            fd.append("meta_title", form.meta_title)
            fd.append("meta_description", form.meta_description)
            fd.append("description", form.description)
            fd.append("keyword", form.keyword)

            // Use ref value — guaranteed to be current even inside async closure
            const currentImage = imageRef.current
            if (currentImage) {
                fd.append("img", currentImage)
                console.log("[IMAGE] appending file:", currentImage.name, currentImage.size)
            } else {
                console.log("[IMAGE] no image selected")
            }

            const res = await api.post(
                "/Wb/add_local_area",
                fd,
                { headers: { "Content-Type": "multipart/form-data" } }
            )

            if (res.data.status == 0) {
                toast.success("Local Area added successfully")
                router.push("/seo-tools/local-area/")
                setForm({
                    city_id: "",
                    name: "",
                    meta_title: "",
                    meta_description: "",
                    description: "",
                    keyword: ""
                })
                imageRef.current = null
                setImage(null)
                setPreview(null)
            } else {
                toast.error(res.data.message)
            }

        } catch (e) {
            console.log(e)
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white">

                {/* CITY SELECT */}
                <Label>* Select City</Label>
                <select
                    name="city_id"
                    value={form.city_id}
                    onChange={handleChange}
                    className="w-full border text-white p-3 rounded bg-gray-950"
                >
                    <option value="">Select City</option>
                    {stateData.map((state) => (
                        <option key={state.id} value={state.id}>
                            {state.name}
                        </option>
                    ))}
                </select>

                {/* NAME */}
                <div className="mt-5">
                    <Label>* Name of Local Area</Label>
                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Local Area Name"
                    />
                </div>

                {/* META TITLE */}
                <div className="mt-5">
                    <Label>* Meta Title of Local Area</Label>
                    <Input
                        name="meta_title"
                        value={form.meta_title}
                        onChange={handleChange}
                    />
                </div>

                {/* META DESCRIPTION */}
                <div className="mt-5">
                    <Label>* Meta description of Area</Label>
                    <Input
                        name="meta_description"
                        value={form.meta_description}
                        onChange={handleChange}
                    />
                </div>

                {/* KEYWORDS */}
                <div className="mt-5">
                    <Label>* Keywords</Label>
                    <TextArea
                        name="keyword"
                        value={form.keyword}
                        onChange={(val) => setForm(prev => ({ ...prev, keyword: val }))}
                        placeholder="Keywords"
                    />
                </div>

                {/* DESCRIPTION */}
                <div className="mt-5">
                    <Label>* Description of Local Area</Label>
                    <TextEditor
                        description={form.description}
                        onChange={(val: any) => setForm(prev => ({ ...prev, description: val }))}
                    />
                </div>

                {/* IMAGE UPLOAD */}
                <div className="mt-5">
                    <Label>Local Area Image</Label>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileRef}
                        onChange={handleImage}
                        className="mt-2 w-full bg-gray-900 p-3 rounded border border-gray-700 text-white text-sm
                                   file:mr-3 file:py-1 file:px-3 file:rounded file:border-0
                                   file:text-xs file:font-medium file:bg-orange-600 file:text-white
                                   hover:file:bg-orange-700 cursor-pointer"
                    />
                </div>

                {/* IMAGE PREVIEW */}
                {preview && (
                    <div className="mt-4 relative w-40">
                        <img src={preview} className="rounded-lg border border-gray-700 w-full" alt="preview" />
                        <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                )}

                {/* SUBMIT */}
                <div className="mt-6">
                    <button
                        onClick={addCity}
                        className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-semibold"
                    >
                        Add Local Area
                    </button>
                </div>

            </div>
        </div>
    )
}