'use client'

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import TextEditor from "@/components/TextEditor";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export default function AddCity(){

    const [stateData,setStateData] = useState<any[]>([])
    const [rmvImage  , setRemoveImage] = useState('')
    const params = useParams()
    const id = params?.id ?? ''

    const fileRef = useRef<HTMLInputElement | null>(null)

    const [form,setForm] = useState({
        state_id:"",
        name:"",
        meta_title:"",
        meta_description:"",
        description:"",
        top_cities:0,
        keyword : "",
        
 
    })
    const router = useRouter()
    const [image,setImage] = useState<File | null>(null)
    const [preview,setPreview] = useState<string | null>(null)
    const [imageRemoved,setImageRemoved] = useState(false)   // BUG FIX 1: track explicit removal
    const [loading,setLoading] = useState(false)             // BUG FIX 2: prevent double submit

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
                            name: data.name ?? "",                          // BUG FIX 3: null safety
                            meta_title: data.meta_title ?? "",
                            meta_description: data.meta_description ?? "",
                            description: data.description ?? "",
                            top_cities: data.top_cities ?? 0 ,
                            keyword : data.keyword ?? "",
                             
                        })

                        if (data.image) {
                            setPreview(data.image)
                            setImageRemoved(false)
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

        // BUG FIX 4: revoke old object URL to avoid memory leak
        if(preview && preview.startsWith("blob:")){
            URL.revokeObjectURL(preview)
        }

        setImage(file)
        setImageRemoved(false)
        setPreview(URL.createObjectURL(file))

    }

    function removeImage(){

        // BUG FIX 4: revoke object URL on removal too
        if(preview && preview.startsWith("blob:")){
            URL.revokeObjectURL(preview)
        }

        setImage(null)
        setPreview(null)
        setImageRemoved(true)   // BUG FIX 1: mark as intentionally removed
        setRemoveImage('1')
        if(fileRef.current){
            fileRef.current.value = ""
        }

    }

    /* ================= RESET FORM ================= */

    function resetForm(){
        setForm({
            state_id:"",
            name:"",
            meta_title:"",
            meta_description:"",
            description:"",
            top_cities:0,
            keyword : ""
        })
        setImage(null)
        setPreview(null)
        setImageRemoved(false)
        setRemoveImage('')
        if(fileRef.current){
            fileRef.current.value = ""
        }
    }

    /* ================= ADD CITY ================= */

    async function addCity(){

        // BUG FIX 5: added name validation that was missing for meta fields
        if(!form.state_id || !form.name){
            return toast.error("Fill required fields")
        }

        // BUG FIX 2: prevent double submit
        if(loading) return
        setLoading(true)

        try{

            const fd = new FormData()
            fd.append("state_id",form.state_id)
            fd.append("name",form.name)
            fd.append("meta_title",form.meta_title)
            fd.append("meta_description",form.meta_description)
            fd.append("description",form.description)
            fd.append("top_cities",String(form.top_cities))
            fd.append("remove_image" , rmvImage)
            if(image){
                fd.append("image",image)
            }else{
                
                fd.append("image","")
            }

            const res = await api.post(
                "/Wb/add_city",
                fd,
                { headers:{ "Content-Type":"multipart/form-data" } }
            )

            if(res.data.status == 0){
                toast.success("City added successfully")
                resetForm()  // BUG FIX 6: use centralized reset
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            toast.error("Something went wrong")
        }finally{
            setLoading(false)  // BUG FIX 2: always re-enable button
        }

    }

    /* ================= UPDATE CITY ================= */

    async function updateCity(){

        // BUG FIX 5: update was missing validation entirely
        if(!form.state_id || !form.name){
            return toast.error("Fill required fields")
        }

        // BUG FIX 2: prevent double submit
        if(loading) return
        setLoading(true)

        try{

            const fd = new FormData()
            fd.append("city_id", id as string)
            fd.append("state_id",form.state_id)
            fd.append("name",form.name)
            fd.append("meta_title",form.meta_title)
            fd.append("meta_description",form.meta_description)
            fd.append("description",form.description)
            fd.append("top_cities",String(form.top_cities))
            fd.append("keyword" , form.keyword)
            fd.append("remove_image" , rmvImage)
            // BUG FIX 1: only send empty string if user explicitly deleted the image
            if(image){
                fd.append("image",image)
            }else if(imageRemoved){
                fd.append("image","")
            }
            // if neither → don't append → backend keeps existing image

            const res = await api.post(
                "/Wb/update_city",
                fd,
                { headers:{ "Content-Type":"multipart/form-data" } }
            )

            if(res.data.status == 0){
                toast.success("City updated successfully")
                router.push('/seo-tools/city')
            }else{
                toast.error(res.data.message)
            }

        }catch(e){
            toast.error("Something went wrong")
        }finally{
            setLoading(false)  // BUG FIX 2: always re-enable button
        }

    }

    return(
        <>
        <div className="space-y-6">

        <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl text-white">

            {/* STATE */}

            <Label>* Select State</Label>

            {/* BUG FIX 7: added default placeholder option so state_id:'' is valid initial state */}
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
                <Label>Meta Title</Label>
                <Input
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                />
            </div>

            {/* META DESCRIPTION */}

            <div className="mt-5">
                <Label>Meta Description</Label>
                <Input
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                />
            </div>
            <div className="mt-5">
                <Label>* Keywords</Label>
                <TextArea
                    name="keyword"
                    value={form.keyword}
                    onChange={(val) => setForm({ ...form, keyword: val })}
                    placeholder="Keywords"
                />
            </div>

            {/* DESCRIPTION */}

            <div className="mt-5">
                <Label>Description</Label>
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
                        form.top_cities==1 ? "bg-green-600" : "bg-gray-600"
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
                    accept="image/*"   // BUG FIX 8: restrict to images only
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
                        alt="City preview"   // BUG FIX 9: missing alt attribute
                        className="rounded-lg border border-gray-700"
                    />
                    <button
                        type="button"        // BUG FIX 10: missing type="button" could submit form
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
                    type="button"            // BUG FIX 10: same here
                    onClick={id ? updateCity : addCity}
                    disabled={loading}       // BUG FIX 2: disable while loading
                    className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {/* BUG FIX 11: show loading state in button text */}
                    {loading ? "Saving..." : id ? "Update City" : "Add City"}
                </button>
            </div>

        </div>

        </div>
        </>
    )
}