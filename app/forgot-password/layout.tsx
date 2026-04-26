import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your TruScan AI account password securely.",
  openGraph: {
    title: "Forgot Password | TruScan AI",
    description: "Reset your TruScan AI account password securely.",
    url: "https://truscan-ai.vercel.app/forgot-password",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
