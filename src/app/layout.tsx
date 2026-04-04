import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import AppProvider from "@/provider/AppProvider";
import AuthProvider from "@/provider/AuthProvider";
import { Toaster } from "sonner";

// ✅ better config
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // 👈 important for performance
  variable: "--font-inter", // optional (for Tailwind usage)
});

export const metadata: Metadata = {
  title: "Poddagolf- Website",
  description:
    "A blogging platform built with Next.js, offering a seamless and engaging experience for writers and readers alike.",
  icons: {
    icon: "/fav.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ Apply both className + variable */}
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <NextTopLoader color="#0070f3" height={3} showSpinner={false} />

        <AppProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}