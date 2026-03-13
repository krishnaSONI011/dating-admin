"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import api, {
  approveAdsApi,
  assignAdsMembershipApi,
  getAdDetailApi,
  type AdDetailData,
} from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const statusLabel: Record<string, string> = {
  "0": "Pending",
  "1": "Approved",
  "2": "Rejected",
};

const MEMBERSHIPS = ["Free", "Silver", "Gold"] as const;
type Membership = (typeof MEMBERSHIPS)[number];

export default function AdDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const [detail, setDetail] = useState<AdDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteAdsModal , setDeleteAdsModal] = useState<true | false > (false)
  const router = useRouter()
  const [deleteLoading , setDeleteLoading] = useState<true | false > (false)

  const refetch = useCallback(() => {
    if (!id) return;
    getAdDetailApi(id).then(setDetail).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getAdDetailApi(id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load ad.");
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleApprove() {
    if (!id) return;
    setActionLoading(true);
    approveAdsApi(id, "1", "NA")
      .then(() => {
        toast.success("Ad approved.");
        refetch();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to approve ad.");
      })
      .finally(() => setActionLoading(false));
  }

  function openRejectModal() {
    setRejectReason(detail?.ads?.rejection_reason ?? "");
    setRejectModalOpen(true);
  }

  function closeRejectModal() {
    setRejectModalOpen(false);
    setRejectReason("");
  }

  function handleRejectSubmit() {
    if (!id) return;
    const reason = rejectReason.trim() || "NA";
    setActionLoading(true);
    approveAdsApi(id, "2", reason)
      .then(() => {
        toast.success("Ad rejected.");
        closeRejectModal();
        refetch();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to reject ad.");
      })
      .finally(() => setActionLoading(false));
  }
  async function deleteAds() {
      try{
        setDeleteLoading(true)
        const fd = new FormData()
        const id = detail?.ads.id ?? ''
        fd.append("ads_id" ,id)
        fd.append("delete_reason" , rejectReason)
        const res = await api.post('/Wb/delete_ads' , fd)
        if(res.data.status == 0){
          toast.success(res.data.message)
          setRejectReason("")
          router.push('/basic-tables')
        }
        else{
          toast.error(res.data.message)
        }
      }catch(e:any){
        toast.error(e)
        console.log(e)
      }finally{
        setDeleteLoading(false)
      }
  }

  // function handleAssignMembership(membership: Membership) {
  //   if (!id) return;
  //   setActionLoading(true);
  //   assignAdsMembershipApi(id, membership)
  //     .then(() => {
  //       toast.success(`Plan set to ${membership}.`);
  //       refetch();
  //     })
  //     .catch((err) => {
  //       toast.error(err instanceof Error ? err.message : "Failed to update plan.");
  //     })
  //     .finally(() => setActionLoading(false));
  // }

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Ad Detail" />
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-center text-gray-500 dark:text-gray-400">Loading ad…</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Ad Detail" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="mb-4 text-gray-500 dark:text-gray-400">Could not load ad.</p>
          <Link href="/basic-tables">
            <Button size="sm">Back to Ads</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ads = detail.ads;
  const timeSlots = detail.time ?? [];
  const services = detail.services ?? [];
  const images = detail.images ?? [];
  const currentMembership = (ads.membership || "Free") as Membership;
  const isApproved = String(ads.is_approved) === "1";

  return (
    <div>
      <PageBreadcrumb pageTitle="Ad Detail" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {ads.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/basic-tables">
                <Button size="sm" className="dark:bg-gray-700 dark:hover:bg-gray-600">
                  Back to Ads
                </Button>
              </Link>
              {/* <Button
                size="sm"
                className="bg-success-500 hover:bg-success-600 dark:bg-success-600"
                onClick={handleApprove}
                disabled={actionLoading || isApproved}
              >
                Approve
              </Button> */}
              <Button
                size="sm"
                className="bg-error-500 hover:bg-error-600 dark:bg-error-600"
                onClick={openRejectModal}
                disabled={actionLoading}
              >
               Delete
              </Button>
            </div>
          </div>

          {/* Plan buttons: Free, Silver, Gold – current disabled, others colored */}
          {/* <div className="mb-6">
            <Label className="mb-2 block">Plan</Label>
            <div className="flex flex-wrap gap-2">
              {MEMBERSHIPS.map((plan) => {
                const isCurrent = currentMembership === plan;
                const silverStyle =
                  plan === "Silver"
                    ? "bg-gray-400 text-white hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600"
                    : "";
                const goldStyle =
                  plan === "Gold"
                    ? "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                    : "";
                const freeStyle =
                  plan === "Free"
                    ? "bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                    : "";
                return (
                  <Button
                    key={plan}
                    size="sm"
                    onClick={() => handleAssignMembership(plan)}
                    disabled={actionLoading || isCurrent}
                    className={
                      isCurrent
                        ? "cursor-not-allowed opacity-60"
                        : plan === "Silver"
                          ? silverStyle
                          : plan === "Gold"
                            ? goldStyle
                            : freeStyle
                    }
                  >
                    {plan}
                    {isCurrent ? " (current)" : ""}
                  </Button>
                );
              })}
            </div>
          </div> */}

          <Modal isOpen={rejectModalOpen} onClose={closeRejectModal}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Delete ad
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Please provide a reason for Deleting this ad.
              </p>
              <div className="mb-6">
                <Label>Reason</Label>
                <TextArea
                  placeholder="Enter delete reason…"
                  value={rejectReason}
                  onChange={setRejectReason}
                  rows={4}
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  loading={deleteLoading}
                  size="sm"
                  className="bg-error-500 hover:bg-error-600 dark:bg-error-600"
                  onClick={deleteAds}
                  disabled={actionLoading}
                >
                  Delete ad
                </Button>
              </div>
            </div>
          </Modal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Images */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Images
              </h3>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={img.img}
                        alt="Ad"
                        className="h-auto w-full max-w-sm object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No images.</p>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{ads.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-800 dark:text-white/90">{ads.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {statusLabel[String(ads.is_approved)] ?? ads.is_approved}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {ads.state_name ?? ads.state}, {ads.city_name ?? ads.city}
                </p>
              </div>
              {ads.description && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {ads.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Services
              </h3>
              <ul className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-200"
                  >
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Time slots */}
          {timeSlots.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Time slots
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {timeSlots.map((t) => (
                  <li key={t.id}>
                    {t.from_time} – {t.to_time}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={deleteAdsModal} onClose={()=>setDeleteAdsModal(false)}>
      <div className="p-6">
    
    <h2 className="text-lg text-white font-semibold mb-3">
      Delete Ads
    </h2>

    <p className="text-sm text-white mb-6">
     Please Provide A Reason to the user to delete his ads
    </p>
    <div>
      <TextArea />
    </div>

    <div className="flex justify-end gap-3">
      
      <Button
        onClick={() => setDeleteAdsModal(false)}
        className=""
      >
        Cancel
      </Button>

      <Button
      loading={deleteLoading}
        onClick={deleteAds}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        Yes, Delete
      </Button>

    </div>
  </div>
      </Modal>
    </div>
  );
}
