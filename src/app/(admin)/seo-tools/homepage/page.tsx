"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import api, { addMetadataApi, getMetadataApi, type MetadataItem } from "@/lib/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import TextEditor from "@/components/TextEditor";
import TextArea from "@/components/form/input/TextArea";

export default function HomePage() {

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedMetaId, setSelectedMetaId] = useState<string | null>(null);
  const [keyword , setKeyword] = useState<any>('')
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Favicon states
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const [removeFavicon, setRemoveFavicon] = useState(false);

  const [searchAreaTitle, setSearchAreaTitle] = useState("");
  const [searchAreaSub, setSearchAreaSub] = useState("");
  const [locationCard, setLocationCard] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [contentSaving, setContentSaving] = useState(false);

  // ================= GET CONTENT =================
  useEffect(() => {
    async function getPageInformation() {
      try {
        const formData = new FormData();
        formData.append("content_id", "1");
        const res = await api.post(`/Wb/content_detail`, formData);
        if (res.data?.status === 0) {
          const d = res.data.data;
          setSearchAreaTitle(d.home_title1 || "");
          setSearchAreaSub(d.home_title2 || "");
          setLocationCard(d.explore_title || "");
          setSearchTitle(d.search_title || "");
          setDescription(d.description || "");
          setBanner(d.home_banner || "")
          
        }
      } catch (e) {
        console.log(e);
      }
    }
    getPageInformation();
  }, []);

  // ================= META =================
  useEffect(() => {
    getMetadataApi()
      .then((data: any) => {
        // Support both array response [{ id, title, favicon }]
        // and object response { id, title, favicon } or { data: { ... } }
        const record = Array.isArray(data)
          ? data[0]
          : data?.id
          ? data
          : data?.data;
        if (record) {
          setMetaTitle(record.title ?? "");
          setMetaDescription(record.description ?? "");
          setSelectedMetaId(String(record.id ?? ""));
          setFaviconUrl(record.favicon ?? "");
          setKeyword(record.keyword || '')
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ================= FAVICON FILE CHANGE =================
  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setFaviconFile(file);
    setRemoveFavicon(false);
    if (file) {
      setFaviconPreview(URL.createObjectURL(file));
    }
  }

  function handleDeleteFavicon() {
    setFaviconFile(null);
    setFaviconPreview("");
    setFaviconUrl("");
    setRemoveFavicon(true);
  }

  // ================= SAVE META =================
  async function handleSaveMeta() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", metaTitle);
      formData.append("description", metaDescription);
      formData.append("keyword" , keyword)
      if (selectedMetaId) formData.append("meta_id", selectedMetaId);

      // Attach favicon file if a new one was selected
      if (faviconFile) {
        formData.append("favicon", faviconFile);
      }

      // Tell the server to wipe the existing favicon
      if (removeFavicon) {
        formData.append("remove_image", "1");
      }

      const res = await api.post("/Wb/update_meta", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status == 0) {
        toast.success("Meta updated");
        // Refresh favicon URL from response if returned
        if (res.data?.data?.favicon) {
          setFaviconUrl(res.data.data.favicon);
          setFaviconPreview("");
          setFaviconFile(null);
        }
        setRemoveFavicon(false);
      } else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ================= SAVE CONTENT =================
  async function handleSaveContent() {
    try {
      setContentSaving(true);
      const formData = new FormData();
      formData.append("content_id", "1");
      formData.append("home_title1", searchAreaTitle);
      formData.append("home_title2", searchAreaSub);
      formData.append("explore_title", locationCard);
      formData.append("search_title", searchTitle);
      formData.append("description", description);
      if (bannerFile) formData.append("home_banner", bannerFile);

      const res = await api.post(`/Wb/update_content`, formData, {
        headers: { "Content-Type": "multipart/form-data", Accept: "application/json" },
      });

      if (res.data?.status === 0) {
        toast.success("Content updated");
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setContentSaving(false);
    }
  }

  // Displayed favicon: new file preview > existing URL
  const displayedFavicon = faviconPreview || faviconUrl;

  return (
    <div className="space-y-6">

      {/* ================= META ================= */}
      <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl">
        <h2 className="text-white text-xl font-semibold mb-4">Meta Details</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-4">
            <Label>Meta Title</Label>
            <Input
              placeholder="Site Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
            <Label>Meta Description</Label>
            <TextArea
              placeholder="Site Description"
              className="bg-gray-900 border-gray-700 text-white"
              value={metaDescription}
              onChange={(value) => setMetaDescription(value)}
            />
             <Label>Keyword</Label>
            <TextArea
              placeholder="Site Keyword"
              className="bg-gray-900 border-gray-700 text-white"
              value={keyword}
              onChange={(value) => setKeyword(value)}
            />

            {/* Favicon */}
            <div>
              <Label className="text-gray-300 mb-2 block">Favicon</Label>

              {/* Preview */}
              {displayedFavicon && (
                <div className="mb-3 flex items-center gap-4">
                  <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-xl border border-gray-700 bg-gray-900 p-2">
                    <img
                      src={displayedFavicon}
                      alt="Favicon preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Current favicon</span>
                    <button
                      type="button"
                      onClick={handleDeleteFavicon}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 border border-red-600/40 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      Remove favicon
                    </button>
                  </div>
                </div>
              )}

              {/* Upload input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFaviconChange}
                className="bg-gray-900 border border-gray-700 text-white p-2 rounded-lg w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Recommended: 32×32px or 64×64px .ico / .png
              </p>
            </div>

            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveMeta}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Meta"}
            </Button>
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="rounded-2xl border border-gray-800 bg-[#020617] p-6 shadow-xl space-y-4">
        <h2 className="text-white text-xl font-semibold">Homepage Content</h2>

        <Input
          placeholder="Search Area Title"
          value={searchAreaTitle}
          onChange={(e) => setSearchAreaTitle(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Search Area Sub Title"
          value={searchAreaSub}
          onChange={(e) => setSearchAreaSub(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Location Card Title"
          value={locationCard}
          onChange={(e) => setLocationCard(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <Input
          placeholder="Page Section Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />

        <div>
          <Label className="text-gray-300">Description</Label>
          <TextEditor
            description={description}
            onChange={(val) => setDescription(val)}
          />
        </div>

        <div>
          <Label className="text-gray-300">Banner Image</Label>
          {banner && (
            <img src={banner} className="h-40 mb-3 rounded-lg border border-gray-700" />
          )}
          <input
            type="file"
            onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
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