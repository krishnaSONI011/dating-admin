"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

/** Profile approval status: is_approved 0=pending, 1=approved, 2=rejected */
export type UserApprovalStatus = "pending" | "approved" | "rejected";

/** Document upload status: is_verified 0=not uploaded, 1=uploaded */
export type UserDocumentsStatus = "uploaded" | "not_uploaded";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  /** Profile status (is_approved): Pending / Approved / Rejected */
  status: UserApprovalStatus;
  /** Documents (is_verified): Uploaded / Not uploaded */
  documents: UserDocumentsStatus;
}

interface UsersTableProps {
  users: UserRow[];
}

const statusBadgeColor: Record<
  UserApprovalStatus,
  "success" | "warning" | "error"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

const documentsBadgeColor: Record<
  UserDocumentsStatus,
  "success" | "warning"
> = {
  uploaded: "success",
  not_uploaded: "warning",
};

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {users.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
            No users found.
          </div>
        ) : (
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-gray-500"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-gray-500"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-gray-500"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-gray-500"
              >
                Documents
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-theme-xs text-gray-500"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                  {user.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    size="sm"
                    color={statusBadgeColor[user.status]}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    size="sm"
                    color={documentsBadgeColor[user.documents]}
                  >
                    {user.documents === "uploaded" ? "Uploaded" : "Not uploaded"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Link href={`/users/${user.id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  );
}
