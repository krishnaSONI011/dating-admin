import { Outfit } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import Providers from "@/components/providers/Providers";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
