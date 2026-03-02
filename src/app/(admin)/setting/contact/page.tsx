'use client'

import Button from "@/components/ui/button/Button"
import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function ContactSetting() {

  const [form, setForm] = useState({
    id: "",
    whatsapp: "",
    telegram: "",
    email: "",
    is_whatsapp: false,
    is_telegram: false,
    is_email: false,
  })

  const [loading, setLoading] = useState(false)

  /* ================= LOAD EXISTING DATA ================= */

  useEffect(() => {

    async function fetchContact() {
      try {
        const fd = new FormData()
        fd.append("contect_id", "1")

        const res = await api.post("/Wb/contect_detail", fd)

        if (res.data.status === 0) {

          const data = res.data.data

          setForm({
            id: data.id,
            whatsapp: data.whatsapp || "",
            telegram: data.telegram || "",
            email: data.email || "",
            is_whatsapp: data.is_whatsapp === "1",
            is_telegram: data.is_telegram === "1",
            is_email: data.is_email === "1",
          })

        }

      } catch (err) {
        console.log(err)
      }
    }

    fetchContact()

  }, [])


  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e: any) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const toggleSwitch = (key: keyof typeof form) => {
    setForm(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  /* ================= SAVE ================= */

  async function handleSave() {

    try {

      setLoading(true)

      const fd = new FormData()

      fd.append("contect_id", form.id)
      fd.append("whatsapp", form.whatsapp)
      fd.append("telegram", form.telegram)
      fd.append("email", form.email)
      fd.append("is_whatsapp", form.is_whatsapp ? "1" : "0")
      fd.append("is_telegram", form.is_telegram ? "1" : "0")
      fd.append("is_email", form.is_email ? "1" : "0")

      const res = await api.post("/Wb/update_contect_details", fd)

      if (res.data.status === 0) {
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message)
      }

    } catch (err) {
      console.log(err)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }


  /* ================= UI ================= */

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-2xl shadow-lg border border-gray-700">

      <h2 className="text-2xl font-bold text-white mb-6">
        Contact Settings
      </h2>

      {/* WhatsApp */}
      <div className="mb-6">
        <label className="block text-white mb-2 font-medium">
          WhatsApp Number
        </label>
        <input
          type="text"
          name="whatsapp"
          value={form.whatsapp}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none"
        />

        <Toggle
          label="Show WhatsApp on Website"
          checked={form.is_whatsapp}
          onChange={() => toggleSwitch("is_whatsapp")}
        />
      </div>

      {/* Telegram */}
      <div className="mb-6">
        <label className="block text-white mb-2 font-medium">
          Telegram Username
        </label>
        <input
          type="text"
          name="telegram"
          value={form.telegram}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none"
        />

        <Toggle
          label="Show Telegram on Website"
          checked={form.is_telegram}
          onChange={() => toggleSwitch("is_telegram")}
        />
      </div>

      {/* Email */}
      <div className="mb-6">
        <label className="block text-white mb-2 font-medium">
          Support Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none"
        />

        <Toggle
          label="Show Email on Website"
          checked={form.is_email}
          onChange={() => toggleSwitch("is_email")}
        />
      </div>

      <Button  onClick={handleSave} className="w-full">
      {loading ? "Saving..." : "Save Settings"}
      </Button>

    </div>
  )
}


/* ================= TOGGLE COMPONENT ================= */

function Toggle({ label, checked, onChange }: any) {

  return (
    <div className="flex items-center justify-between mt-3">

      <span className="text-gray-300 text-sm">{label}</span>

      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition ${
          checked ? "bg-green-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </button>

    </div>
  )
}