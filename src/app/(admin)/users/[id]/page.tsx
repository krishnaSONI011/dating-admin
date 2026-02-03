"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  approveUserApi,
  getUserProfileApi,
  type UserProfileData,
} from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const statusLabel: Record<string, string> = {
  "0": "Pending",
  "1": "Approved",
  "2": "Rejected",
};

export default function UserProfilePage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const refetchProfile = useCallback(() => {
    if (!id) return;
    getUserProfileApi(id).then(setProfile).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const tid = setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);
    getUserProfileApi(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load profile.");
          setProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [id]);

  function handleApprove() {
    if (!id) return;
    setActionLoading(true);
    approveUserApi(id, "1", "NA")
      .then(() => {
        toast.success("Profile approved.");
        refetchProfile();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to approve.");
      })
      .finally(() => setActionLoading(false));
  }

  function openRejectModal() {
    setRejectReason(profile?.rejection_reason ?? "");
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
    approveUserApi(id, "2", reason)
      .then(() => {
        toast.success("Profile rejected.");
        closeRejectModal();
        refetchProfile();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to reject.");
      })
      .finally(() => setActionLoading(false));
  }

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User Profile" />
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User Profile" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="mb-4 text-gray-500 dark:text-gray-400">
            Could not load profile.
          </p>
          <Link href="/users">
            <Button size="sm">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  const adharUrls: string[] = [];
  if (profile.adhar) adharUrls.push(profile.adhar);
  if (Array.isArray(profile.user_adhar)) {
    profile.user_adhar.forEach((item) => {
      if (item.adhar && !adharUrls.includes(item.adhar)) adharUrls.push(item.adhar);
    });
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User Profile" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {profile.name ?? profile.email}
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/users">
                <Button size="sm" className="dark:bg-gray-700 dark:hover:bg-gray-600">
                  Back to Users
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-success-500 hover:bg-success-600 dark:bg-success-600"
                onClick={handleApprove}
                disabled={actionLoading || String(profile.is_approved) === "1"}
              >
                Approve
              </Button>
              <Button
                size="sm"
                className="bg-error-500 hover:bg-error-600 dark:bg-error-600"
                onClick={openRejectModal}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </div>
          </div>

          <Modal isOpen={rejectModalOpen} onClose={closeRejectModal}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Reject profile
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Please provide a reason for rejecting this profile.
              </p>
              <div className="mb-6">
                <Label>Reason</Label>
                <TextArea
                  placeholder="Enter rejection reason…"
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
                  size="sm"
                  className="bg-error-500 hover:bg-error-600 dark:bg-error-600"
                  onClick={handleRejectSubmit}
                  disabled={actionLoading}
                >
                  Reject profile
                </Button>
              </div>
            </div>
          </Modal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Current profile image */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Current profile image
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                {profile.current_pic ? (
                  <img
                    src={profile.current_pic}
                    alt="Profile"
                    className="h-auto w-full max-w-sm object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Adhar (Aadhaar) documents */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Adhar documents
              </h3>
              {adharUrls.length > 0 ? (
                <div className="space-y-3">
                  {adharUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={url}
                        alt={`Adhar ${idx + 1}`}
                        className="h-auto w-full max-w-sm object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  No adhar uploaded
                </div>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {profile.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {statusLabel[profile.is_approved] ?? profile.is_approved}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Documents</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {profile.is_verified === 1 || String(profile.is_verified).trim() === "1"
                  ? "Uploaded"
                  : "Not uploaded"}
              </p>
            </div>
            {profile.rejection_reason && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rejection reason</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {profile.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
