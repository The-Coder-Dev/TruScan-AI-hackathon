import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 md:px-16 text-center">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-0">
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Ready to protect your business?
            </h2>
            <p className="text-lg text-white/75 max-w-xl mx-auto mb-8 leading-relaxed">
              Join 500+ security teams using TruScan AI to stop deepfake calls and SMS scams before they do damage.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold shadow-lg group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-full px-8 font-semibold bg-transparent"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/50">
              No credit card required · Free plan forever · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
