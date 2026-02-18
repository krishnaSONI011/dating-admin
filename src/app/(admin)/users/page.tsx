"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import UsersTable from "@/components/tables/UsersTable";
import type { UserRow } from "@/components/tables/UsersTable";
import { getAllUsersApi, type ApiUser } from "@/lib/api";
import { toast } from "react-toastify";
import React, { useEffect, useMemo, useState } from "react";

/** Profile status filter: is_approved 0=pending, 1=approved, 2=rejected */
type StatusFilter = "all" | "pending" | "approved" | "rejected";

function mapApiUserToRow(user: ApiUser): UserRow {
  const statusMap = {
    "0": "pending" as const,
    "1": "approved" as const,
    "2": "rejected" as const,
  };
  // is_verified can be string "1"/"0" or number 1/0 from API
  const isVerified =
    user.is_verified === 1 || String(user.is_verified).trim() === "1";
  return {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    status: statusMap[user.is_approved as keyof typeof statusMap] ?? "pending",
    documents: isVerified ? "uploaded" : "not_uploaded",
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllUsersApi()
      .then((data) => {
        if (!cancelled) setUsers(data.map(mapApiUserToRow));
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load users.");
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const idQuery = userIdFilter.trim();
    return users.filter((u) => {
      const matchStatus =
        statusFilter === "all" || u.status === statusFilter;
      const matchId =
        !idQuery || String(u.id) === idQuery || String(u.id).includes(idQuery);
      const matchName =
        !query || (u.name && u.name.toLowerCase().includes(query)) || u.email.toLowerCase().includes(query);
      return matchStatus && matchId && matchName;
    });
  }, [users, statusFilter, userIdFilter, searchQuery]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <ComponentCard title="All users">
          {loading ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading users…
            </p>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label>User ID</Label>
                  <Input
                    type="text"
                    placeholder="Filter by user ID"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    key={statusFilter}
                    placeholder="All statuses"
                    defaultValue={statusFilter}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" },
                    ]}
                    onChange={(val) => setStatusFilter(val as StatusFilter)}
                  />
                </div>
                <div>
                  <Label>Search by name or email</Label>
                  <Input
                    type="text"
                    placeholder="Search name or email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <UsersTable users={filteredUsers} />
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
