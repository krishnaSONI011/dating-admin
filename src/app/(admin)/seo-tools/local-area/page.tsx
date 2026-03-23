'use client'

import api from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import TextEditor from "@/components/TextEditor"
import Link from "next/link"

export default function LocalArea() {

  const [cities, setCities] = useState<any[]>([])
  const [selectedCity, setSelectedCity] = useState("")
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingArea, setEditingArea] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const isSuccess = (res: any) => String(res?.data?.status) === "0"

  // ================= LOAD CITIES =================
  async function getCities() {
    try {

      const res = await api.post('/Wb/all_cities')

      if (isSuccess(res) && Array.isArray(res.data.data)) {

        const list = res.data.data
        setCities(list)

        if (list.length > 0) {
          const firstCity = list[0]
          setSelectedCity(firstCity.slug)
          getAreas(firstCity.slug)
        }
      }

    } catch {
      toast.error("Failed to load cities")
    }
  }

  // ================= LOAD AREAS =================
  async function getAreas(citySlug: string) {

    if (!citySlug) {
      setAreas([])
      return
    }

    try {

      setLoading(true)

      const formData = new FormData()
      formData.append("city_slug", citySlug)

      const res = await api.post('/Wb/get_areas_by_city', formData)

      if (isSuccess(res) && Array.isArray(res.data.data)) {
        setAreas(res.data.data)
      } else {
        setAreas([])
      }

    } catch {
      setAreas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCities()
  }, [])

  function handleCityChange(value: string) {
    setSelectedCity(value)
    getAreas(value)
  }

  function openAdd() {
    setEditingArea(null)
    setName("")
    setDescription("")
    setImage(null)
    setShowModal(true)
  }

  function openEdit(area: any) {

    setEditingArea(area)
    setName(area?.name || "")
    setDescription(area?.description || "")

    const citySlug = cities.find(c => c.id == area.city_id)?.slug
    if (citySlug) setSelectedCity(citySlug)

    setImage(null)
    setShowModal(true)
  }

  const cityObj = cities.find(c => c.slug === selectedCity)

  // ================= DELETE =================
  async function handleDelete(areaId: string) {

    if (!confirm("Delete this area?")) return

    try {

      const formData = new FormData()
      formData.append("area_id", areaId)

      const res = await api.post('/Wb/delete_local_area', formData)

      if (isSuccess(res)) {
        toast.success("Area deleted")
        getAreas(selectedCity)
      }

    } catch {
      toast.error("Delete failed")
    }
  }

  // ================= SAVE =================
  async function handleSave() {

    if (!name.trim()) {
      toast.error("Area name required")
      return
    }

    if (!cityObj) {
      toast.error("Invalid city")
      return
    }

    try {

      const formData = new FormData()

      formData.append("city_id", cityObj.id)
      formData.append("name", name)
      formData.append("description", description)

      if (image) formData.append("img", image)

      let res

      if (editingArea) {

        formData.append("area_id", editingArea.id)

        res = await api.post('/Wb/update_local_area', formData)

      } else {

        res = await api.post('/Wb/add_local_area', formData)

      }

      if (isSuccess(res)) {

        toast.success(editingArea ? "Area updated" : "Area added")

        setShowModal(false)
        setName("")
        setDescription("")
        setImage(null)

        getAreas(selectedCity)
      }

    } catch {
      toast.error("Save failed")
    }
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white space-y-6">

      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Local Areas</h2>
        <Link href={'/seo-tools/local-area/add'}>
        
        <button  className="bg-green-600 px-4 py-2 rounded-lg">
          + Add Area
        </button>
        </Link>
      </div>

      {/* City Select */}
      <select
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
      >
        {cities.map(city => (
          <option key={city.id} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3">#</th>
            <th className="p-3">Name</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>

          {areas.map((area, index) => {

            const cityObj = cities.find(c => c.slug === selectedCity)

            return (
              <tr key={area.id} className="border-b border-gray-800">

                <td className="p-3">{index + 1}</td>

                <td className="p-3">{area.name}</td>

                <td className="p-3 space-x-2">

                  <Link
                    href={`/seo-tools/local-area/edit/${area.id}?city_id=${cityObj?.id}`}
                  >
                    <button className="bg-blue-600 px-3 py-1 rounded text-sm">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDelete(area.id)}
                    className="bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            )
          })}

        </tbody>

      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">

          <div className="bg-[#020617] p-6 rounded-xl w-[500px] space-y-4">

            <h3 className="text-lg font-semibold">
              {editingArea ? "Edit Area" : "Add Area"}
            </h3>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            >
              {cities.map(city => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Area Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            />

            <TextEditor
              description={description}
              onChange={setDescription}
            />

            <input
              type="file"
              onChange={(e: any) => setImage(e.target.files?.[0] ?? null)}
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}