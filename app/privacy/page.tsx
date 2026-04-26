import type { Metadata } from "next";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how TruScan AI collects, uses, and protects your data.",
  openGraph: {
    title: "Privacy Policy | TruScan AI",
    description: "Learn how TruScan AI collects, uses, and protects your data.",
    url: "https://truscan.ai/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 pt-24 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            &larr; Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At TruScan AI ("we", "our", or "us"), we prioritize your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our deepfake and scam detection services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our services, you agree to this privacy policy. If you do not agree with our policies and practices, please do not use TruScan AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">2.1 Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you register for an account, we collect personal information such as your name, email address, and billing information.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">2.2 Uploaded Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide our core services, we temporarily process audio recordings and text messages you upload. This content is analyzed strictly for fraud detection and is not used to train our general models without your explicit consent. Uploaded audio files are securely deleted after analysis unless you opt-in to save them in your history.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">2.3 Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain information about your device and how you interact with our platform, including IP addresses, browser types, and API usage metrics.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our fraud detection services.</li>
              <li>To process transactions and manage your account.</li>
              <li>To communicate with you regarding updates, security alerts, and support.</li>
              <li>To analyze usage patterns and optimize our platform's performance.</li>
              <li>To detect, prevent, and address technical issues or fraudulent activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security & Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures, including encryption in transit and at rest, to protect your data. Your analysis history is securely stored only if you choose to keep it. Temporary files used for active scanning are purged immediately after the scan completes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use trusted third-party service providers (such as Stripe for payments or Supabase for database infrastructure) to assist us in operating our platform. These providers have access to your data only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the right to access, update, or delete your personal information. You can manage your data preferences through your account settings or by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 inline-block">
              <a href="mailto:privacy@truscan.ai" className="text-foreground font-medium hover:text-primary transition-colors">
                privacy@truscan.ai
              </a>
            </div>
          </section>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-4">Ready to secure your communications?</p>
          <Link href="/signup">
            <Button className="font-semibold" size="lg">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
