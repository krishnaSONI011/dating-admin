'use client'

import { useEffect, useState, ChangeEvent } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"
import Button from "@/components/ui/button/Button"

export default function FooterSetting() {

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    footer_id: "1",
    description: "",
    copy_right: "",
    dmca_html: ""
  })

  /* ================= FETCH EXISTING DATA ================= */
  useEffect(() => {
    async function getFooter() {
      try {
        const formData = new FormData()
        formData.append("footer_id", "1")

        const res = await api.post("/Wb/footer_detail", formData)

        if (res.data.status == "0") {

          const data = res.data.data

          setForm({
            footer_id: "1",
            description: data.description || "",
            copy_right: data.copy_right || "",
            dmca_html: data.link || ""
          })
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

  /* ================= UPDATE FOOTER ================= */
  async function handleSubmit() {

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("footer_id", form.footer_id)
      formData.append("description", form.description)
      formData.append("copy_right", form.copy_right)
      formData.append("link", form.dmca_html)

      const res = await api.post("/Wb/update_footer", formData)

      if (res.data.status == "0") {
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

        <h1 className="text-3xl font-bold mb-8">
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
            rows={4}
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

        {/* DMCA HTML Code */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">
            DMCA HTML Code
          </label>

          <textarea
            name="dmca_html"
            value={form.dmca_html}
            onChange={handleChange}
            rows={6}
            placeholder="<a href='...'><img src='...' /></a>"
            className="w-full bg-black border border-gray-700 rounded-xl p-4 font-mono text-sm outline-none focus:border-orange-500"
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Update Footer"}
        </Button>

      </div>

    </div>
  )
}