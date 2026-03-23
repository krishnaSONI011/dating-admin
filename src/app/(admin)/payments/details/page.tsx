'use client'

import { useEffect, useState, ChangeEvent } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"

interface PaymentData {
  id: string
  qr: string
  upi: string
  account_no: string
  ifsc: string
  status: string
}

export default function Details() {

  const [loading, setLoading] = useState(false)
  const [qrPreview, setQrPreview] = useState<string>("")
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [removeQr, setRemoveQr] = useState(false) // ✅ track removal

  const [form, setForm] = useState<PaymentData>({
    id: "1",
    qr: "",
    upi: "",
    account_no: "",
    ifsc: "",
    status: "1"
  })

  useEffect(() => { fetchPayment() }, [])

  async function fetchPayment() {
    try {
      const fd = new FormData()
      fd.append("payment_id", "1")
      const res = await api.post("/Wb/payments_detail", fd)

      if (res.data.status === 0) {
        const data = res.data.data
        setForm({
          id: data.id,
          qr: data.qr,
          upi: data.upi,
          account_no: data.account_no,
          ifsc: data.ifsc,
          status: data.status
        })
        setQrPreview(data.qr || "")
        setRemoveQr(false)
        setQrFile(null)
      }
    } catch (e) {
      console.log(e)
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleQrChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setQrFile(file)
    setQrPreview(URL.createObjectURL(file))
    setRemoveQr(false)
  }

  //  Simple delete — just clear preview and flag removal
  function handleDeleteQr() {
    setQrPreview("")
    setQrFile(null)
    setRemoveQr(true)
  }

  async function handleUpdate() {
    try {
      setLoading(true)

      const fd = new FormData()
      fd.append("payment_id", form.id)
      fd.append("upi", form.upi)
      fd.append("account_no", form.account_no)
      fd.append("ifsc", form.ifsc)
      fd.append("status", form.status)

      if (qrFile) {
        fd.append("qr", qrFile)
      } else if (removeQr) {
       
        fd.append("remove_image", "1")
      }

      const res = await api.post("/Wb/update_payments", fd)

      if (res.data.status === 0) {
        toast.success("Payment details updated successfully")
        fetchPayment()
      } else {
        toast.error(res.data.message || "Update failed")
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
      <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>

        {/* UPI */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">UPI ID</label>
          <input
            type="text" name="upi" value={form.upi} onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        {/* Account No */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Account Number</label>
          <input
            type="text" name="account_no" value={form.account_no} onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        {/* IFSC */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">IFSC Code</label>
          <input
            type="text" name="ifsc" value={form.ifsc} onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Status</label>
          <select
            name="status" value={form.status} onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* QR IMAGE */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">QR Code</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleQrChange}
            className="mb-4"
          />

          {/* Preview with simple Delete button below */}
          {qrPreview && (
            <div className="mt-2 space-y-2">
              <div className="w-40 h-40 border border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={qrPreview}
                  alt="QR Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleDeleteQr}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-xl font-semibold disabled:opacity-50 transition"
        >
          {loading ? "Updating..." : "Update Payment"}
        </button>

      </div>
    </div>
  )
}