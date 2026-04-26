  import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Start your free trial with TruScan AI. Protect yourself and your business from deepfake fraud calls and SMS scams.",
  openGraph: {
    title: "Create Account | TruScan AI",
    description: "Start your free trial with TruScan AI. Protect yourself and your business from deepfake fraud calls and SMS scams.",
    url: "https://truscan-ai.vercel.app/signup",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
