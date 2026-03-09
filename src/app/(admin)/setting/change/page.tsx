'use client'

import { useState } from "react"
import api from "@/lib/api"
import { toast } from "react-toastify"

export default function Change(){

  const [form,setForm] = useState({
    old_password:"",
    new_password:"",
    confirm_password:""
  })

  const [loading,setLoading] = useState(false)

  function handleChange(e:any){
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })
  }

  async function changePassword(){

    if(!form.old_password || !form.new_password){
      return toast.error("Fill all fields")
    }

    if(form.new_password !== form.confirm_password){
      return toast.error("Passwords do not match")
    }

    try{

      setLoading(true)

      const fd = new FormData()

      fd.append("old_password",form.old_password)
      fd.append("new_password",form.new_password)

      const res = await api.post("/Wb/change_password",fd)

      if(res.data.status == "0"){
        toast.success("Password changed successfully")

        setForm({
          old_password:"",
          new_password:"",
          confirm_password:""
        })

      }else{
        toast.error(res.data.message)
      }

    }catch(e){
      console.log(e)
      toast.error("Something went wrong")
    }
    finally{
      setLoading(false)
    }
  }

  return(
    <div className="min-h-screen bg-gray-950 flex justify-center items-center px-4">

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6">

        <h1 className="text-xl font-semibold text-white mb-6">
          Change Password
        </h1>

        <div className="space-y-4">

          {/* OLD PASSWORD */}
          <input
            type="password"
            name="old_password"
            placeholder="Old Password"
            value={form.old_password}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded"
          />

          {/* NEW PASSWORD */}
          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={form.new_password}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded"
          />

          {/* CONFIRM PASSWORD */}
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded"
          />

          {/* BUTTON */}
          <button
            onClick={changePassword}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>

        </div>

      </div>

    </div>
  )
}