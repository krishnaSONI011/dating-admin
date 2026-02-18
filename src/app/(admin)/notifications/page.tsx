"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import {
  getAdminNotificationsApi,
  getAllUsersApi,
  sendNotificationApi,
  type ApiNotificationItem,
  type ApiUser,
} from "@/lib/api";
import { toast } from "react-toastify";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

type SendType = "all" | "selected";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SendType>("all");
  const [sending, setSending] = useState(false);

  const [list, setList] = useState<ApiNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [approvedUsers, setApprovedUsers] = useState<ApiUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const fetchList = useCallback((p: number) => {
    getAdminNotificationsApi(p)
      .then((res) => {
        setList(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.total_pages || 1);
        setTotalRecords(res.total_records || 0);
      })
      .catch((err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to load notifications."
        );
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList(page);
  }, [page, fetchList]);

  // Load all approved users once for \"selected\" notifications
  useEffect(() => {
    let cancelled = false;
    getAllUsersApi()
      .then((users) => {
        if (cancelled) return;
        const approved = users.filter(
          (u) => String(u.is_approved ?? "").trim() === "1"
        );
        setApprovedUsers(approved);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load users for selection."
          );
          setApprovedUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApprovedUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return approvedUsers;
    return approvedUsers.filter((u) => {
      const idMatch = u.id.toLowerCase().includes(q);
      const nameMatch = (u.name ?? "").toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      return idMatch || nameMatch || emailMatch;
    });
  }, [approvedUsers, userSearch]);

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    const t = title.trim();
    const m = message.trim();
    if (!t) {
      toast.error("Title is required.");
      return;
    }
    if (!m) {
      toast.error("Message is required.");
      return;
    }
    if (type === "selected") {
      if (selectedUserIds.length === 0) {
        toast.error("Select at least one approved user.");
        return;
      }
      setSending(true);
      sendNotificationApi(t, m, "selected", selectedUserIds)
        .then(() => {
          toast.success("Notification sent to selected users.");
          setTitle("");
          setMessage("");
          setSelectedUserIds([]);
          setUserSearch("");
          setPage(1);
          fetchList(1);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to send notification.");
        })
        .finally(() => setSending(false));
    } else {
      setSending(true);
      sendNotificationApi(t, m, "all")
        .then(() => {
          toast.success("Notification sent to all users.");
          setTitle("");
          setMessage("");
          setPage(1);
          fetchList(1);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Failed to send notification.");
        })
        .finally(() => setSending(false));
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Send Notification" />
      <div className="space-y-6">
        <ComponentCard title="Send notification">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input
                type="text"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Message</Label>
              <textarea
                placeholder="Notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div>
              <Label>Send to</Label>
              <Select
                key={type}
                placeholder="All users or selected"
                defaultValue={type}
                options={[
                  { value: "all", label: "All users" },
                  { value: "selected", label: "Selected users" },
                ]}
                onChange={(val) => setType(val as SendType)}
              />
            </div>
            {type === "selected" && (
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <Label>Approved users</Label>
                    <Input
                      type="text"
                      placeholder="Search by name, email, or ID"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 md:ml-4">
                    Selected: {selectedUserIds.length}
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  {loadingUsers ? (
                    <p className="px-2 py-3 text-gray-500 dark:text-gray-400">
                      Loading approved users…
                    </p>
                  ) : filteredApprovedUsers.length === 0 ? (
                    <p className="px-2 py-3 text-gray-500 dark:text-gray-400">
                      No approved users found.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filteredApprovedUsers.map((u) => {
                        const checked = selectedUserIds.includes(u.id);
                        return (
                          <li
                            key={u.id}
                            className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs sm:text-sm">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                checked={checked}
                                onChange={() => toggleUserSelection(u.id)}
                              />
                              <span className="truncate">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {u.name || u.email}
                                </span>
                                <span className="ml-1 text-gray-500 dark:text-gray-400">
                                  ({u.email}) • ID {u.id}
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "Send notification"}
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Notification history">
          {loading ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Loading…
            </p>
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No notifications yet.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Title
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Message
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Type
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Users
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {list.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {row.title}
                        </TableCell>
                        <TableCell className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-400">
                          <span title={row.message}>{row.message}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-sm dark:bg-gray-700">
                            {row.type === "all" ? "All users" : "Selected"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {row.total_users}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {row.created_at}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {page} of {totalPages} ({totalRecords} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
