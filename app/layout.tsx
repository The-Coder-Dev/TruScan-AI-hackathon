import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/home/ConditionalNavbar";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://truscan.ai"),
  title: {
    default: "TruScan AI — Deepfake & Scam Detection",
    template: "%s | TruScan AI",
  },
  description: "Protect yourself and your business from deepfake fraud calls, voice cloning, and SMS scams with our real-time AI-powered detection platform.",
  keywords: ["deepfake detection", "fraud prevention", "AI voice analysis", "SMS scam detector", "voice cloning detection", "cybersecurity"],
  authors: [{ name: "TruScan AI Team" }],
  creator: "TruScan AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://truscan.ai",
    title: "TruScan AI — Deepfake & Scam Detection",
    description: "Enterprise-grade AI detection for deepfake calls and SMS scams. Stop fraudsters before they cause damage.",
    siteName: "TruScan AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TruScan AI — Deepfake & Scam Detection",
    description: "Enterprise-grade AI detection for deepfake calls and SMS scams.",
    creator: "@TruScanAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
