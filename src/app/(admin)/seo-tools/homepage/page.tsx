"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import api, { addMetadataApi, getMetadataApi, type MetadataItem } from "@/lib/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import TextEditor from "@/components/TextEditor";

export default function HomePage() {

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedMetaId, setSelectedMetaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchAreaTitle , setSearchAreaTitle] = useState('')
  const [searchAreaSub , setSearchAreaSub] = useState('')
  const [locationCard , setLocationCard] = useState('')
  const [searchTitle , setSearchTitle] = useState('')
  const [description , setDescription] = useState('')
  const [banner , setBanner] = useState('')
  const [bannerFile,setBannerFile] = useState<File | null>(null)
  const [contentSaving,setContentSaving] = useState(false)

  // ================= GET CONTENT =================
  useEffect(()=>{
    async function getPageInformation(){
      try{
        const formData = new FormData()
        formData.append('content_id',"1")

        const res = await api.post(`/Wb/content_detail`, formData)

        if(res.data?.status === 0){
          const d = res.data.data
          setSearchAreaTitle(d.home_title1 || '')
          setSearchAreaSub(d.home_title2 || '')
          setLocationCard(d.explore_title || '')
          setSearchTitle(d.search_title || '')
          setDescription(d.description || '')
          setBanner(d.home_banner || '')
        }
      }catch(e){
        console.log(e)
      }
    }
    getPageInformation()
  },[])

  // ================= META =================
  useEffect(() => {
    getMetadataApi()
      .then((data:any) => {
        const first = Array.isArray(data) ? data[0] : undefined;
        if (first) {
          setMetaTitle(first.title ?? "");
          setMetaDescription(first.description ?? "");
          setSelectedMetaId(first.id ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ================= SAVE META =================
  function handleSaveMeta() {
    setSaving(true);
    addMetadataApi(metaTitle, metaDescription, selectedMetaId ?? undefined)
      .then(() => toast.success("Meta updated"))
      .catch(()=>toast.error("Save failed"))
      .finally(() => setSaving(false));
  }

  // ================= SAVE CONTENT =================
  async function handleSaveContent(){
    try{
      setContentSaving(true)

      const formData = new FormData()
      formData.append("content_id","1")
      formData.append("home_title1", searchAreaTitle)
      formData.append("home_title2", searchAreaSub)
      formData.append("explore_title", locationCard)
      formData.append("search_title", searchTitle)
      formData.append("description", description)

      if(bannerFile){
        formData.append("home_banner", bannerFile)
      }
      console.log(bannerFile)

      const res = await api.post(
        `/Wb/update_content`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json",
          }
        }
      )

      if(res.data?.status === 0){
        toast.success("Content updated ")
      }else{
        toast.error(res.data?.message || "Update failed")
      }

    }catch(e){
      toast.error("Something went wrong")
    }finally{
      setContentSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ================= META ================= */}
      <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl">
        <h2 className="text-white text-xl font-semibold mb-4">Meta Details</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            <Input
              placeholder="Site Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />

            <Input
              placeholder="Site Description"
              className="mt-3 bg-gray-900 border-gray-700 text-white"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />

            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleSaveMeta} disabled={saving}>
              {saving ? "Saving..." : "Save Meta"}
            </Button>
          </>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl space-y-4">

        <h2 className="text-white text-xl font-semibold">Homepage Content</h2>

        <Input
          placeholder="Search Area Title"
          value={searchAreaTitle}
          onChange={(e)=>setSearchAreaTitle(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Search Area Sub Title"
          value={searchAreaSub}
          onChange={(e)=>setSearchAreaSub(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Location Card Title"
          value={locationCard}
          onChange={(e)=>setLocationCard(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Page Section Title"
          value={searchTitle}
          onChange={(e)=>setSearchTitle(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <div>
          <Label className="text-gray-300">Description</Label>
          <TextEditor 
            description={description}
            onChange={(val)=>setDescription(val)}
          />
        </div>

        <div>
          <Label className="text-gray-300">Banner Image</Label>

          {banner && (
            <img src={banner} className="h-40 mb-3 rounded-lg border border-gray-700"/>
          )}

<input
  type="file"
  onChange={(e)=>setBannerFile(e.target.files?.[0] || null)}
  className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full"
/>
        </div>

        <Button 
          onClick={handleSaveContent}
          disabled={contentSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {contentSaving ? "Saving..." : "Save Content"}
        </Button>

      </div>
    </div>
  );
}