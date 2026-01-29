import Image from "next/image";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { useState } from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";

interface Escort {
  id: number;
  name: string;
  image: string;
  gender: string;
  city: string;
  status: "Active" | "Pending" | "Inactive";
}

export default function PagesTable(){
    const [PageData , setPageData] = useState<Escort[]>([])

    const escortData: Escort[] = PageData;
    return(
        <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>

          {/* HEADER */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                Escort
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                Gender
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                City
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {escortData.map((escort) => (
              <TableRow key={escort.id}>

                {/* Escort Info */}
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={escort.image}
                        alt={escort.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {escort.name}
                    </span>
                  </div>
                </TableCell>

                {/* Gender */}
                <TableCell className="px-5 py-4 text-theme-sm text-gray-500">
                  {escort.gender}
                </TableCell>

                {/* City */}
                <TableCell className="px-5 py-4 text-theme-sm text-gray-500">
                  {escort.city}
                </TableCell>

                {/* Status */}
                <TableCell className="px-5 py-4">
                  <Badge
                    size="sm"
                    color={
                      escort.status === "Active"
                        ? "success"
                        : escort.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {escort.status}
                  </Badge>
                </TableCell>

                {/* Action */}
                <TableCell className="px-5 py-4">
                  <Button  size="sm">View Profile</Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
        
        </>
    )
}