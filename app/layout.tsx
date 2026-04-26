import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/home/ConditionalNavbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TruScan AI — Deepfake & Scam Detection",
  description: "Protect yourself from deepfake fraud calls & SMS scams with AI-powered real-time detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased `}
    >
      <body className="min-h-full flex flex-col">
        <ConditionalNavbar />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
