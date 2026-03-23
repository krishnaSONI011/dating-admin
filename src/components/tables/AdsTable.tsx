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
import type { ApiAd } from "@/lib/api";

type AdStatus = "pending" | "approved" | "rejected";

const statusMap: Record<string, AdStatus> = {
  "0": "pending",
  "1": "approved",
  "2": "rejected",
};

const statusBadgeColor: Record<AdStatus, "success" | "warning" | "error"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

interface AdsTableProps {
  ads: ApiAd[];
}

export default function AdsTable({ ads }: AdsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        {ads.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
            No ads found.
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
                {/* <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-gray-500"
                >
                  Gender
                </TableCell> */}
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-gray-500"
                >
                  City
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-theme-xs text-gray-500"
                >
                 Promotion
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
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {ads.map((ad) => {
                const status = statusMap[ad.is_approved] ?? "pending";
                return (
                  <TableRow key={ad.id}>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                      {ad.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {ad.email}
                    </TableCell>
                    {/* <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {ad.gender}
                    </TableCell> */}
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {ad.city_name ?? ad.city ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {ad.is_promoted == "1" ? <Badge size="sm" color={statusBadgeColor[status]}>Promoted</Badge> : <Badge size="sm" color={'warning'}>Not Promoted</Badge>}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={statusBadgeColor[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Link href={`/basic-tables/ads/${ad.slug}`}>
                        <Button size="sm">View Ad</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
