import type { Metadata } from "next";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using TruScan AI's platform.",
  openGraph: {
    title: "Terms of Service | TruScan AI",
    description: "Terms and conditions for using TruScan AI's platform.",
    url: "https://truscan-ai.vercel.app/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 pt-24 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            &larr; Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <FileText className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the TruScan AI website, dashboard, API, and associated services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              TruScan AI provides a software-as-a-service platform that utilizes artificial intelligence to analyze audio recordings and text messages to detect potential deepfakes, fraud, and scams. Our analysis provides probabilistic indicators and should be used as a supplementary tool in your decision-making process, not as absolute proof of authenticity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Responsibilities & Prohibited Uses</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You are responsible for any content you submit to the Services. You agree not to use the Services to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Upload any material that violates the intellectual property or privacy rights of others.</li>
              <li>Attempt to reverse engineer, decompile, or extract the source code or underlying models of our Services.</li>
              <li>Bypass or attempt to bypass any usage limits, billing mechanisms, or security measures.</li>
              <li>Use the platform to develop competing products or services.</li>
              <li>Upload illegal, harmful, or explicitly offensive content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Services, including but not limited to our AI models, algorithms, codebase, UI designs, and branding, are the exclusive property of TruScan AI and its licensors. You retain all rights to the audio and text data you upload; however, by uploading data, you grant us a temporary license to process it solely to provide the Services to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment & Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of the Services require payment. By selecting a subscription plan, you agree to pay the applicable fees in accordance with our pricing terms. Subscription fees are billed in advance on a recurring basis. All payments are non-refundable unless legally required or stated otherwise in our refund policy. We reserve the right to modify our pricing with adequate notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TruScan AI is provided on an "as is" and "as available" basis. We do not guarantee that our fraud detection will be 100% accurate. In no event shall TruScan AI, its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Services, or from any decisions you make based on our analysis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Services after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms, please contact our legal team at:
            </p>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 inline-block">
              <a href="mailto:legal@truscan.ai" className="text-foreground font-medium hover:text-primary transition-colors">
                legal@truscan.ai
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
