'use client'

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextEditor from "@/components/TextEditor";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export default function AddCity(){

    const [stateData,setStateData] = useState<any[]>([])
    const params = useParams()
    const id = params?.id ?? ''

    const fileRef = useRef<HTMLInputElement | null>(null)

    const [form,setForm] = useState({
        state_id:"",
        name:"",
        meta_title:"",
        meta_description:"",
        description:"",
        top_cities:0
    })
    const router = useRouter()
    const [image,setImage] = useState<File | null>(null)
    const [preview,setPreview] = useState<string | null>(null)

    /* ================= LOAD CITY DETAIL ================= */

   /* ================= LOAD STATES + CITY ================= */

useEffect(() => {

    const loadData = async () => {

        try {

            /* LOAD STATES FIRST */

            const stateRes = await api.post('/Wb/states')

            if (stateRes.data.status == 0) {
                setStateData(stateRes.data.data)
            }

            /* THEN LOAD CITY */

            if (id) {

                const fd = new FormData()
                fd.append("city_id", id as string)

                const cityRes = await api.post('/Wb/city_detail', fd)

                if (cityRes.data.status == 0) {

                    const data = cityRes.data.data

                    setForm({
                        state_id: String(data.state_id),
                        name: data.name,
                        meta_title: data.meta_title,
                        meta_description: data.meta_description,
                        description: data.description,
                        top_cities: data.top_cities
                    })

                    if (data.image) {
                        setPreview(data.image)
                    }

                }

            }

        } catch (e) {

            toast.error("Failed to load data")

        }

    }

    loadData()

}, [id])

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
            fd.append("top_cities",String(form.top_cities))

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
                    description:"",
                    top_cities:0
                })

                setImage(null)
                setPreview(null)

                if(fileRef.current){
                    fileRef.current.value = ""
                }

            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            toast.error("Something went wrong")
        }

    }

    /* ================= UPDATE CITY ================= */

    async function updateCity(){

        try{

            const fd = new FormData()

            fd.append("city_id", id as string)
            fd.append("state_id",form.state_id)
            fd.append("name",form.name)
            fd.append("meta_title",form.meta_title)
            fd.append("meta_description",form.meta_description)
            fd.append("description",form.description)
            fd.append("top_cities",String(form.top_cities))

            if(image){
                fd.append("image",image)
            }

            const res = await api.post(
                "/Wb/update_city",
                fd,
                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )

            if(res.data.status == 0){
                toast.success("City updated successfully")
                router.push('/seo-tools/city')
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
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

               

                {stateData.map((state)=>(
                    <option key={state.id} value={String(state.id)}>
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

                <Label>* Meta Title</Label>

                <Input
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                />

            </div>

            {/* META DESCRIPTION */}

            <div className="mt-5">

                <Label>* Meta Description</Label>

                <Input
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                />

            </div>

            {/* DESCRIPTION */}

            <div className="mt-5">

                <Label>* Description</Label>

                <TextEditor
                    description={form.description}
                    onChange={(val:any)=>setForm({...form,description:val})}
                />

            </div>

            {/* TOP CITY */}

            <div className="mt-5">

                <Label>Top City</Label>

                <button
                    type="button"
                    onClick={()=>setForm({...form,top_cities:form.top_cities===1?0:1})}
                    className={`px-4 py-2 rounded font-semibold ${
                        form.top_cities==1
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                >
                    {form.top_cities==1 ? "Yes" : "No"}
                </button>

            </div>

            {/* IMAGE */}

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
                    onClick={id ? updateCity : addCity}
                    className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-semibold"
                >
                    {id ? "Update City" : "Add City"}
                </button>

            </div>

        </div>

        </div>
        </>
    )
}