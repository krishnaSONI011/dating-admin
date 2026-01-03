import Image from "next/image";
import { Metadata } from "next";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = {
  title: "Escort Profile | Admin Dashboard",
  description: "View and manage escort profile",
};

// TEMP DATA (later replace with API call using id)
const escort = {
  name: "Shaifali",
  gender: "Female",
  email: "shaifali@gmail.com",
  phone: "+91 9876543210",
  city: "Indore",
  area: "Vijay Nagar",
  status: "Pending",
  description:
    "Elegant, classy, and friendly companion offering premium companionship services with discretion and professionalism.",
  images: [
    "/images/user/owner.jpg",
    "/images/user/owner.jpg",
    "/images/user/owner.jpg",
  ],
};

export default function EscortProfilePage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Escort Profile
        </h2>

        <Badge
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
      </div>

      {/* IMAGE GALLERY */}
      <div className="grid gap-4 sm:grid-cols-3">
        {escort.images.map((img, index) => (
          <div
            key={index}
            className="relative h-64 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <Image
              src={img}
              alt={`Escort image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* BASIC INFO */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Basic Information
        </h3>

        <div className="grid text-white gap-4 md:grid-cols-2 text-sm">
          <p><span className="font-medium">Name:</span> {escort.name}</p>
          <p><span className="font-medium">Gender:</span> {escort.gender}</p>
          <p><span className="font-medium">Email:</span> {escort.email}</p>
          <p><span className="font-medium">Phone:</span> {escort.phone}</p>
          <p><span className="font-medium">City:</span> {escort.city}</p>
          <p><span className="font-medium">Area:</span> {escort.area}</p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
          Description
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {escort.description}
        </p>
      </div>

      {/* ADMIN ACTIONS */}
      <div className="flex justify-end gap-4">
        <Button className="bg-red-600 hover:bg-red-700">
          Reject
        </Button>

        <Button variant="primary">
          Approve
        </Button>
      </div>
    </div>
  );
}
