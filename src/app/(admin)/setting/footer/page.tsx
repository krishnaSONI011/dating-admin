'use client'

import { useEffect, useState, ChangeEvent } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import Button from "@/components/ui/button/Button"


export default function FooterSetting() {

  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [form, setForm] = useState({
    footer_id: "1",
    description: "",
    copy_right: "",
    img: null as File | null
  })

  /* ================= FETCH EXISTING DATA ================= */
  useEffect(() => {
    async function getFooter() {
      try {
        const formData = new FormData()
        formData.append("footer_id", "1")

        const res = await api.post("/Wb/footer_detail", formData)

        if (res.data.status === 0) {
          const data = res.data.data

          setForm(prev => ({
            ...prev,
            description: data.description || "",
            copy_right: data.copy_right || ""
          }))

          setImagePreview(data.img || "")
        }

      } catch (e) {
        console.log(e)
      }
    }

    getFooter()
  }, [])

  /* ================= HANDLE INPUT ================= */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setForm(prev => ({ ...prev, img: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  /* ================= UPDATE FOOTER ================= */
  async function handleSubmit() {

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("footer_id", form.footer_id)
      formData.append("description", form.description)
      formData.append("copy_right", form.copy_right)

      if (form.img) {
        formData.append("img", form.img)
      }

      const res = await api.post("/Wb/update_footer", formData)

      if (res.data.status === 0) {
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }

    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <div className="max-w-3xl mx-auto bg-[#0f172a] p-8 rounded-2xl border border-gray-800">

        <h1 className="text-3xl font-bold mb-8 text-white">
          Footer Settings
        </h1>

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">
            Footer Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* Copyright */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">
            Copyright Text
          </label>

          <input
            type="text"
            name="copy_right"
            value={form.copy_right}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">
            DMCA Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="mb-4"
          />

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-12 object-contain border border-gray-700 rounded-lg"
            />
          )}
        </div>

        {/* Submit */}
        <Button  onClick={handleSubmit}>
          Update Footer
        </Button>

      </div>

    </div>
  )
}