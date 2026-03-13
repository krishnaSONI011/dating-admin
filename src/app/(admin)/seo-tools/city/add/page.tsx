'use client'

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextEditor from "@/components/TextEditor";
import api from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export default function AddCity(){

    const [stateData,setStateData] = useState<any[]>([])
    const fileRef = useRef<HTMLInputElement | null>(null)
    const [form,setForm] = useState({
        state_id:"",
        name:"",
        meta_title:"",
        meta_description:"",
        description:""
    })

    const [image,setImage] = useState<File | null>(null)
    const [preview,setPreview] = useState<string | null>(null)

    /* ================= LOAD STATES ================= */

    useEffect(()=>{
        async function getStates() {
            try {
                const res = await api.post('/Wb/states')

                if (res.data.status == 0) {
                    setStateData(res.data.data)
                }
            } catch (error) {
                toast.error("Failed to load states")
            } 
        }

        getStates()

    },[])

    /* ================= HANDLE INPUT ================= */

    function handleChange(e:any){
        setForm({
            ...form,
            [e.target.name]:e.target.value
        })
    }

    /* ================= HANDLE IMAGE ================= */

    function handleImage(e:any){

        const file = e.target.files[0]

        if(!file) return

        setImage(file)

        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    function removeImage(){
        setImage(null)
        setPreview(null)
    
        if(fileRef.current){
            fileRef.current.value = ""
        }
    }

    /* ================= ADD CITY ================= */

    async function addCity(){

        if(!form.state_id || !form.name){
            return toast.error("Fill required fields")
        }

        try{

            const fd = new FormData()

            fd.append("state_id",form.state_id)
            fd.append("name",form.name)
            fd.append("meta_title",form.meta_title)
            fd.append("meta_description",form.meta_description)
            fd.append("description",form.description)

            if(image){
                fd.append("image",image)
            }

            const res = await api.post(
                "/Wb/add_city",
                fd,
                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )

            if(res.data.status == 0){

                toast.success("City added successfully")

                setForm({
                    state_id:"",
                    name:"",
                    meta_title:"",
                    meta_description:"",
                    description:""
                })

                setImage(null)
                setPreview(null)

            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            console.log(e)
            toast.error("Something went wrong")
        }

    }

    return(
        <>
        <div className="space-y-6">

        <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white">

            {/* STATE */}
            <Label>* Select State</Label>

            <select
                name="state_id"
                value={form.state_id}
                onChange={handleChange}
                className="w-full border text-white p-3 rounded bg-gray-950"
            >

                <option value="">Select State</option>

                {stateData.map((state)=>(
                    <option key={state.id} value={state.id}>
                        {state.name}
                    </option>
                ))}

            </select>

            {/* CITY NAME */}
            <div className="mt-5">

                <Label>* Name of city</Label>

                <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="City Name"
                />

            </div>

            {/* META TITLE */}
            <div className="mt-5">

                <Label>* Meta Title of city</Label>

                <Input
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                />

            </div>

            {/* META DESCRIPTION */}
            <div className="mt-5">

                <Label>* Meta description of city</Label>

                <Input
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                />

            </div>

            {/* DESCRIPTION */}
            <div className="mt-5">

                <Label>* Description of city</Label>

                <TextEditor
                    description={form.description}
                    onChange={(val:any)=>setForm({...form,description:val})}
                />

            </div>

            {/* IMAGE UPLOAD */}
            <div className="mt-5">

                <Label>City Image</Label>

                <input
    type="file"
    ref={fileRef}
    onChange={handleImage}
    className="mt-2 w-full bg-gray-900 p-3"
/>

            </div>

            {/* IMAGE PREVIEW */}
            {preview && (

                <div className="mt-4 relative w-40">

                    <img
                        src={preview}
                        className="rounded-lg border border-gray-700"
                    />

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
                    Add City
                </button>

            </div>

        </div>

        </div>
        </>
    )
}