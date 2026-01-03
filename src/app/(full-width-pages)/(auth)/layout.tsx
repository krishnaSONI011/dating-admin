import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row dark:bg-gray-900">

          {/* LEFT – AUTH CONTENT */}
          <div className="flex w-full items-center justify-center lg:w-1/2">
            {children}
          </div>

          {/* RIGHT – IMAGE SECTION */}
          <div className="relative hidden h-full w-1/2 lg:block">
            
            {/* Background Image */}
            <Image
              src="/images/ss.webp"
              alt="Luxury model"
              fill
              priority
              className="object-cover"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <GridShape />
            </div>

            {/* Branding Content */}
            <div className="absolute bottom-16 left-1/2 z-20 w-full max-w-xs -translate-x-1/2 text-center">
              <Link href="/" className="mb-4 inline-block">
                <Image
                  width={200}
                  height={40}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </Link>

              <p className="text-sm text-gray-300">
                Discreet • Elegant • Premium Companionship
              </p>
            </div>
          </div>

          {/* THEME TOGGLER */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>

        </div>
      </ThemeProvider>
    </div>
  );
}
