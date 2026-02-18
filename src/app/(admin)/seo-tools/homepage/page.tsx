"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { addMetadataApi, getMetadataApi, type MetadataItem } from "@/lib/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export default function HomePage() {
  const [metadataList, setMetadataList] = useState<MetadataItem[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedMetaId, setSelectedMetaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const searches = [
    "call girl in Indore",
    "call girl in Jaipur",
    "call girl in Delhi",
    "call girl in Mumbai",
    "call girl in Bangalore",
    "call girl in Pune",
    "call girl in Ahmedabad",
    "call girl in Bhopal",
    "call girl in Noida",
    "call girl in Gurugram",
    "call girl in Chandigarh",
    "call girl in Kolkata",
    "call girl in Chennai",
    "call girl in Hyderabad",
    "call girl in Surat",
    "call girl in Vadodara",
    "call girl in Udaipur",
    "call girl in Jodhpur",
  ];

  useEffect(() => {
    let cancelled = false;
    getMetadataApi()
      .then((data) => {
        if (cancelled) return;
        setMetadataList(Array.isArray(data) ? data : []);
        const first = Array.isArray(data) ? data[0] : undefined;
        if (first) {
          setMetaTitle(first.title ?? "");
          setMetaDescription(first.description ?? "");
          setSelectedMetaId(first.id ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load meta details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function selectMetaForEdit(item: MetadataItem) {
    setSelectedMetaId(item.id);
    setMetaTitle(item.title ?? "");
    setMetaDescription(item.description ?? "");
  }

  function handleSaveMeta() {
    setSaving(true);
    addMetadataApi(metaTitle, metaDescription, selectedMetaId ?? undefined)
      .then(() => {
        toast.success("Meta details saved successfully.");
        return getMetadataApi();
      })
      .then((data) => {
        setMetadataList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save meta details.");
      })
      .finally(() => setSaving(false));
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-3">
          <h1 className="text-white text-2xl p-2">Meta Details Of The Site</h1>
          <div>
            {loading ? (
              <p className="py-4 text-gray-500 dark:text-gray-400">Loading meta details…</p>
            ) : (
              <>
                {/* API metadata list */}
                {/* {metadataList.length > 0 ? (
                  <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/5">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                            Title
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                            Description
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                            Updated
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                        {metadataList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="px-5 py-4 text-black dark:text-white">
                              {item.title}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 max-w-md truncate">
                              {item.description}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">
                              {item.updated}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <Button
                                size="sm"
                                onClick={() => selectMetaForEdit(item)}
                                className={selectedMetaId === item.id ? "ring-2 ring-brand-500" : ""}
                              >
                                {selectedMetaId === item.id ? "Editing" : "Edit"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="mb-6 text-gray-500 dark:text-gray-400">No metadata from API yet.</p>
                )} */}

                <div className="grid grid-cols-1 gap-3">
                  <div className="col-span-1 relative mt-2">
                    <Input
                      placeholder="Affair Escorts"
                      type="text"
                      className="pl-[120px]"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Site Title
                    </span>
                  </div>
                  <div className="col-span-1 relative mt-2">
                    <Input
                      placeholder="Affair Escorts"
                      type="text"
                      className="pl-[150px]"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Site Description
                    </span>
                  </div>
                  <Button className="mt-5" onClick={handleSaveMeta} disabled={saving}>
                    {saving ? "Saving…" : "Save Change"}
                  </Button>
                </div>
                </>
              )}
          </div>
        </div>
      </div>

      {/* <div className="mt-10 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-white text-2xl p-2">Home Page Tabs</h1>
        <div className="grid grid-cols-6">
          {searches.map((name, index) => (
            <span key={index} className="m-2">
              <Badge size="lg">{name}</Badge>
            </span>
          ))}
          <Button onClick={() => setOpen(true)} className="col-span-6 mt-5">Add More</Button>
        </div>

        <Modal isOpen={open} onClose={() => setOpen(false)} showCloseButton={true}>
                            <div className="text-white p-3">
                                <h1 className="text-xl m-3">Add Tag name</h1>
                                <Label className="mt-5">Tag Name</Label>
                                    <Input placeholder="call girl in indore" className="" type="text" />
                                    <Label className="mt-5">Link to Tag</Label>
                                    <Input placeholder="https://affairescorts.com/call-girl-indore" className="" type="text" />
          <Button className="mt-4 w-full">Add</Button>
        </div>
      </Modal>
      </div> */}
    </>
  );
}