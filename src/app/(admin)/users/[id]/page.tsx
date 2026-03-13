"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import api, {
  addWalletBalanceApi,
  approveUserApi,
  getUserProfileApi,
  type UserProfileData,
} from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState("");
  const [updatingWallet, setUpdatingWallet] = useState(false);
  const [blockModal , setBlockModal] = useState<boolean>(false)
  const [blockDescription , setBlockDescription] = useState<string>('')
  const [blockLoading , setBlockLoading] = useState<false | true>(false)
  const [deleteModal , setDeletModal] = useState<false | true>(false)
  const [deleteLoading , setDeleteLoading] = useState<false | true>(false)
  const router = useRouter()
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

  async function  handleDeleteUser() {
      try{
        setDeleteLoading(true)
        const fd = new FormData()
        fd.append("user_id" , id)
        
          const res = await api.post('/Wb/delete_user' , fd)
          if(res.data.status == 0){
            toast.success (res.data.message)
            setDeletModal(false)
            router.push('/users')
           
          }else{
            toast.error (res.data.message)
            setDeletModal(false)
          }
      }catch(e:any){
        toast.error(e)
        console.log(e)
      }finally{
        setDeleteLoading(false)
      }
  }
  

  function closeRejectModal() {
    setRejectModalOpen(false);
    setRejectReason("");
  }
  async function BlockAndUnblockTheUser(){
    try{
      setBlockLoading(true)
      const fd = new FormData()
      
      let block  = profile?.is_block == "0" ? "1" : "0"
     
      fd.append("user_id" , id  )
      fd.append("is_block" , block)
      fd.append("block_reason" , blockDescription)
      const res = await api.post('/Wb/block_user' , fd)
      if(res.data.status == 0) {
        toast.success(res.data.message)
        setBlockModal(false)
        refetchProfile()
        setBlockDescription("")

      }else {
        toast.error(res.data.message)
        setBlockModal(false)
        setBlockDescription("")
      }

    }catch(e:any){
      toast.error(e)
      console.log(e)
    }finally{
      setBlockLoading(false)
    }
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

  function openWalletModal() {
    setWalletBalance(profile?.wallet_balance ?? "0.00");
    setWalletModalOpen(true);
  }

  function closeWalletModal() {
    setWalletModalOpen(false);
    setWalletBalance("");
  }

  function handleUpdateWallet() {
    if (!id) return;
    const balance = walletBalance.trim();
    if (!balance || isNaN(Number(balance))) {
      toast.error("Please enter a valid balance amount.");
      return;
    }
    setUpdatingWallet(true);
    addWalletBalanceApi(id, balance)
      .then(() => {
        toast.success("Wallet balance updated successfully.");
        closeWalletModal();
        refetchProfile();
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to update wallet balance.");
      })
      .finally(() => setUpdatingWallet(false));
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
              {
                profile?.is_block == "0" ?  <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-700 dark:bg-orange-500"
                onClick={()=> setBlockModal(true)}
                disabled={actionLoading}
              >
                Block
              </Button> :  <Button
                size="sm"
                loading={blockLoading}
                className="bg-orange-500 hover:bg-orange-700 dark:bg-orange-500"
                onClick={BlockAndUnblockTheUser}
                
              >
                Unblock
              </Button>
              }
              <Button  size="sm" className="bg-red-700 hover:bg-red-800 dark:bg-red-700" onClick={()=> setDeletModal(true)}>
                  Delete
              </Button>
              
            </div>
          </div>

          {/* Wallet Balance Section */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Balance</p>
                <p className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  ₹{profile.wallet_balance ?? "0.00"}
                </p>
              </div>
              <Button
                size="sm"
                onClick={openWalletModal}
                className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-600"
              >
                Update Balance
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

          {/* Update Wallet Balance Modal */}
          <Modal isOpen={walletModalOpen} onClose={closeWalletModal}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Update Wallet Balance
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Current balance: ₹{profile.wallet_balance ?? "0.00"}
              </p>
              <div className="mb-6">
                <Label>New Wallet Balance</Label>
                <Input
                  type="number"
                  placeholder="Enter balance amount (e.g., 500)"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="mt-1.5"
                  step={0.01}
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeWalletModal}
                  disabled={updatingWallet}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-600"
                  onClick={handleUpdateWallet}
                  disabled={updatingWallet}
                >
                  {updatingWallet ? "Updating…" : "Update Balance"}
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {profile?.mobile}
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
      {/* block modal */}
      <Modal isOpen={blockModal}  onClose={()=> setBlockModal(false)}>
        <div className="p-5 mt-10">
        <h1 className="text-white  text-xl">Enter the Reason for block</h1>
        <div>
          <TextArea onChange={(value) => setBlockDescription(value)} value={blockDescription}  className="mt-6"></TextArea>
          
        </div>
        <div className="flex gap-5 mt-5 justify-center">
          <Button loading={blockLoading} onClick={BlockAndUnblockTheUser}>Submit</Button>
          <Button onClick={()=> setBlockModal(false)} className="bg-red-600 hover:bg-red-700">Cancle</Button>
        </div>
        </div>
        
      </Modal>
      {/* delete modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeletModal(false)}>
  <div className="p-6">
    
    <h2 className="text-lg text-white font-semibold mb-3">
      Delete User
    </h2>

    <p className="text-sm text-white mb-6">
      Are you sure you want to delete this user? If you delete the user, all ads related to this user will also be permanently deleted.
    </p>

    <div className="flex justify-end gap-3">
      
      <Button
        onClick={() => setDeletModal(false)}
        className=""
      >
        Cancel
      </Button>

      <Button
      loading={deleteLoading}
        onClick={handleDeleteUser}
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
