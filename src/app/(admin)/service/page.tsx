'use client'

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"

export default function Serveice() {

  const [services, setServices] = useState<any[]>([])
  const [subServices, setSubServices] = useState<any[]>([])
  const [newService, setNewService] = useState("")
  const [newSubService, setNewSubService] = useState("")
  const [selectedService, setSelectedService] = useState("")

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadServices()
    loadSubServices()
  }, [])

  const loadServices = async () => {
    try {
      const res = await api.get("/Wb/services")

      if (res?.data?.status === "0") {
        setServices(res.data.data || [])
      } else {
        toast.error(res?.data?.message || "Failed to load services")
      }

    } catch (err) {
      console.log(err)
      toast.error("Service load error")
    }
  }

  const loadSubServices = async () => {
    try {
      const res = await api.get("/Wb/sub_services")

      if (res?.data?.status === "0") {
        setSubServices(res.data.data || [])
      } else {
        toast.error(res?.data?.message || "Failed to load sub services")
      }

    } catch (err) {
      console.log(err)
      toast.error("Sub service load error")
    }
  }

  /* ================= ADD SERVICE ================= */

  const handleAddService = async () => {

    if (!newService.trim())
      return toast.error("Enter service name")

    try {
      const fd = new FormData()
      fd.append("title", newService)

      const res = await api.post("/Wb/add_services", fd)

      if (res?.data?.status == "0") {
        toast.success("Service added")
        setNewService("")
        loadServices()
      } else {
        toast.error(res?.data?.message)
      }

    } catch (err) {
      console.log(err)
      toast.error("Add service failed")
    }
  }

  /* ================= DELETE SERVICE ================= */

  const handleDeleteService = async (id: string) => {

    if (!confirm("Delete this service?")) return

    try {
      const fd = new FormData()
      fd.append("service_id", id)

      const res = await api.post("/Wb/delete_service", fd)

      if (res?.data?.status == "0") {
        toast.success("Service deleted")
        loadServices()
        loadSubServices()
      } else {
        toast.error(res?.data?.message)
      }

    } catch (err) {
      console.log(err)
      toast.error("Delete failed")
    }
  }

  /* ================= ADD SUB SERVICE ================= */

  const handleAddSubService = async () => {

    if (!selectedService)
      return toast.error("Select service first")

    if (!newSubService.trim())
      return toast.error("Enter sub service")

    try {
      const fd = new FormData()
      fd.append("service_id", selectedService)
      fd.append("title", newSubService)

      const res = await api.post("/Wb/add_sub_services", fd)

      if (res?.data?.status == "0") {
        toast.success("Sub service added")
        setNewSubService("")
        loadSubServices()
      } else {
        toast.error(res?.data?.message)
      }

    } catch (err) {
      console.log(err)
      toast.error("Add sub service failed")
    }
  }

  /* ================= DELETE SUB SERVICE ================= */

  const handleDeleteSubService = async (id: string) => {

    if (!confirm("Delete this sub service?")) return

    try {
      const fd = new FormData()
      fd.append("sub_service_id", id)

      const res = await api.post("/Wb/delete_sub_service", fd)

      if (res?.data?.status == "0") {
        toast.success("Sub service deleted")
        loadSubServices()
      } else {
        toast.error(res?.data?.message)
      }

    } catch (err) {
      console.log(err)
      toast.error("Delete failed")
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-3xl font-bold mb-8">
        Service Management
      </h1>

      {/* ADD SERVICE */}
      <div className="bg-slate-900 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Add Service Category
        </h2>

        <div className="flex gap-4">
          <input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Enter service name"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
          />

          <button
            onClick={handleAddService}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* ADD SUB SERVICE */}
      <div className="bg-slate-900 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Add Sub Service
        </h2>

        <div className="flex gap-4 mb-4">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
          >
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <input
            value={newSubService}
            onChange={(e) => setNewSubService(e.target.value)}
            placeholder="Enter sub service"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
          />

          <button
            onClick={handleAddSubService}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* SERVICE LIST */}
      <div className="grid md:grid-cols-2 gap-6">

        {services.map(service => (

          <div
            key={service.id}
            className="bg-slate-900 p-6 rounded-xl border border-gray-700"
          >

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {service.title}
              </h3>

              <button
                onClick={() => handleDeleteService(service.id)}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2">

              {subServices
                .filter(sub => sub.service_id == service.id)
                .map(sub => (
                  <div
                    key={sub.id}
                    className="flex justify-between bg-gray-800 px-3 py-2 rounded"
                  >
                    <span>{sub.title}</span>

                    <button
                      onClick={() => handleDeleteSubService(sub.id)}
                      className="text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}