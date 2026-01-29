"use client";

import Button from "@/components/ui/button/Button";
import { useState } from "react";

interface SeoPage {
  id: number;
  pageName: string;
  location: string;
  localArea: string;
}

export default function Page() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    pageName: "",
    location: "",
    localArea: "",
  });

  const handleCreate = () => {
    if (!form.pageName || !form.location) return;

    setPages((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
      },
    ]);

    setForm({ pageName: "", location: "", localArea: "" });
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          SEO Pages
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
        >
          + Add Page
        </button>
      </div>

      {/* TABLE (TailAdmin style) */}
      <div className="rounded-2xl border border-stroke  shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-6 py-3 font-medium text-black dark:text-white">
                  Page Name
                </th>
                <th className="px-6 py-3 font-medium text-black dark:text-white">
                  Location
                </th>
                <th className="px-6 py-3 font-medium text-black dark:text-white">
                  Local Area
                </th>
              </tr>
            </thead>

            <tbody>
              {pages.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No SEO pages created
                  </td>
                </tr>
              )}

              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-6 py-4 text-black dark:text-white">
                    {page.pageName}
                  </td>
                  <td className="px-6 py-4 text-black dark:text-white">
                    {page.location}
                  </td>
                  <td className="px-6 py-4 text-black dark:text-white">
                    {page.localArea}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-black p-6 shadow-default dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Add SEO Page
            </h3>

            <div className="space-y-4">
              {/* Page Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Page Name
                </label>
                <input
                  type="text"
                  value={form.pageName}
                  onChange={(e) =>
                    setForm({ ...form, pageName: e.target.value })
                  }
                  className="w-full rounded border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full rounded border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* Local Area */}
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                  Local Area
                </label>
                <input
                  type="text"
                  value={form.localArea}
                  onChange={(e) =>
                    setForm({ ...form, localArea: e.target.value })
                  }
                  className="w-full rounded border border-stroke px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setOpen(false)}
                  className="bg-red-500 hover:bg-red-700"
                >
                  Cancel
                </Button>
                <button
                  onClick={handleCreate}
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  Create Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
