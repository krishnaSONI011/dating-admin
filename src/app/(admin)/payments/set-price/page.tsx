"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { getPricingApi, updatePricingApi, type ApiPricingItem } from "@/lib/api";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";

export default function SetPricePage() {
  const [items, setItems] = useState<ApiPricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getPricingApi()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setEdits(
          data.reduce(
            (acc, i) => {
              acc[i.id] = i.coins;
              return acc;
            },
            {} as Record<string, string>
          )
        );
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load pricing.");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCoins = (id: string, value: string) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (item: ApiPricingItem) => {
    const coins = edits[item.id] ?? item.coins;
    setSavingId(item.id);
    updatePricingApi(item.id, item.title, coins)
      .then(() => {
        toast.success("Pricing updated.");
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, coins, updated_at: new Date().toISOString() } : i
          )
        );
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to update pricing.");
      })
      .finally(() => setSavingId(null));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Pricing Setting" />
      <div className="space-y-6">
        <ComponentCard title="Set price">
          {loading ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading pricing…
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 pr-4 text-sm font-medium text-gray-600 dark:text-gray-400">ID</th>
                    <th className="pb-3 pr-4 text-sm font-medium text-gray-600 dark:text-gray-400">Title</th>
                    <th className="pb-3 pr-4 text-sm font-medium text-gray-600 dark:text-gray-400">Coins</th>
                    <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {item.id}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {item.title}
                      </td>
                      <td className="py-2 pr-4">
                        <Input
                          type="text"
                          value={edits[item.id] ?? item.coins}
                          onChange={(e) => setCoins(item.id, e.target.value)}
                          placeholder="Coins"
                          className="min-w-[100px]"
                        />
                      </td>
                      <td className="py-2">
                        <Button
                          type="button"
                          onClick={() => handleSave(item)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? "Saving…" : "Update"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
