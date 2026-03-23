"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import AdsTable from "@/components/tables/AdsTable";
import { getAllAdsApi, type ApiAd } from "@/lib/api";
import { toast } from "react-toastify";
import React, { useEffect, useMemo, useState } from "react";

type StatusFilter   = "all" | "pending" | "approved" | "rejected";
type PromotedFilter = "all" | "promoted" | "not_promoted";

export default function BasicTables() {
  const [ads, setAds] = useState<ApiAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adIdFilter, setAdIdFilter] = useState("");
  const [promotedFilter, setPromotedFilter] = useState<PromotedFilter>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    getAllAdsApi()
      .then((data) => {
        if (!cancelled) setAds(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load ads.");
          setAds([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const adStatusMap: Record<string, StatusFilter> = {
    "0": "pending",
    "1": "approved",
    "2": "rejected",
  };

  const cityOptions = useMemo(() => {
    const values = Array.from(
      new Set(ads.map((ad) => ad.city_name ?? ad.city).filter(Boolean))
    ).sort();
    return [
      { value: "all", label: "All cities" },
      ...values.map((v) => ({ value: String(v), label: String(v) })),
    ];
  }, [ads]);

  const filteredAds = useMemo(() => {
    const query   = searchQuery.trim().toLowerCase();
    const idQuery = adIdFilter.trim();
    return ads.filter((ad) => {
      const adStatus = adStatusMap[ad.is_approved] ?? "pending";

      const matchStatus   = statusFilter === "all" || adStatus === statusFilter;
      const matchCity     = cityFilter === "all" || String(ad.city_name ?? ad.city) === cityFilter;
      const matchId       = !idQuery || String(ad.id) === idQuery || String(ad.id).includes(idQuery);
      const matchSearch   =
        !query ||
        (ad.name        && ad.name.toLowerCase().includes(query))        ||
        (ad.email       && ad.email.toLowerCase().includes(query))       ||
        (ad.description && ad.description.toLowerCase().includes(query));

      const isPromoted    = String(ad.is_promoted) === "1";
      const matchPromoted =
        promotedFilter === "all" ||
        (promotedFilter === "promoted"     && isPromoted)  ||
        (promotedFilter === "not_promoted" && !isPromoted);

      return matchStatus && matchCity && matchId && matchSearch && matchPromoted;
    });
  }, [ads, statusFilter, searchQuery, adIdFilter, promotedFilter, cityFilter]);

  return (
    <div>
      <PageBreadcrumb pageTitle="All Ads" />
      <div className="space-y-6">
        <ComponentCard title="Ads listed on the website">
          {loading ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading ads…
            </p>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <Label>Ad ID</Label>
                  <Input
                    type="text"
                    placeholder="Filter by ad ID"
                    value={adIdFilter}
                    onChange={(e) => setAdIdFilter(e.target.value)}
                  />
                </div>

                {/* Promoted filter — replaces State */}
                <div>
                  <Label>Promoted</Label>
                  <Select
                    key={promotedFilter}
                    placeholder="All"
                    defaultValue={promotedFilter}
                    options={[
                      { value: "all",          label: "All"          },
                      { value: "promoted",     label: "Promoted"     },
                      { value: "not_promoted", label: "Not Promoted" },
                    ]}
                    onChange={(val) => setPromotedFilter(val as PromotedFilter)}
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Select
                    key={cityFilter}
                    placeholder="All cities"
                    defaultValue={cityFilter}
                    options={cityOptions}
                    onChange={setCityFilter}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    key={statusFilter}
                    placeholder="All statuses"
                    defaultValue={statusFilter}
                    options={[
                      { value: "all",      label: "All statuses" },
                      { value: "pending",  label: "Pending"      },
                      { value: "approved", label: "Approved"     },
                      { value: "rejected", label: "Rejected"     },
                    ]}
                    onChange={(val) => setStatusFilter(val as StatusFilter)}
                  />
                </div>

                <div>
                  <Label>Search by name, email </Label>
                  <Input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <AdsTable ads={filteredAds} />
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}