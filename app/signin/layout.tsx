import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your TruScan AI account to access the dashboard and protect your communications.",
  openGraph: {
    title: "Sign In | TruScan AI",
    description: "Sign in to your TruScan AI account to access the dashboard and protect your communications.",
    url: "https://truscan-ai.vercel.app/signin",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
