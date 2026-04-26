import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/ month",
    description: "A lightweight way to try. No cost, no card, no hassle.",
    cta: "Start for free",
    ctaVariant: "outline" as const,
    href: "/signup",
    features: [
      "500 calls analyzed / month",
      "100 SMS scans / month",
      "Basic risk scoring",
      "Email alerts",
      "Community support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "Full suite detection for growing security teams.",
    cta: "Get started",
    ctaVariant: "default" as const,
    href: "/signup",
    badge: "Most Popular",
    features: [
      "10,000 calls analyzed / month",
      "Unlimited SMS scans",
      "Voice fingerprinting",
      "Real-time webhook alerts",
      "Threat dashboard",
      "API access",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "/ month",
    description: "Enterprise-grade API and unlimited analysis.",
    cta: "Get started",
    ctaVariant: "outline" as const,
    href: "/signup",
    features: [
      "Unlimited calls analyzed",
      "Unlimited SMS scans",
      "Full API access (5,000 RPM)",
      "Advanced voice fingerprinting",
      "Custom threat rules",
      "SSO & team management",
      "SLA & dedicated support",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            Pricing plans
          </span>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Flexible pricing for every team
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Start free, scale when you need it.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/25 ring-0"
                  : "bg-white border border-border/60 hover:border-primary/30 hover:shadow-lg"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-primary border border-primary/20 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-6">
                <p className={`text-sm font-semibold mb-3 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-5xl font-bold tracking-tight ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-2 ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              {/* CTA */}
              <Link href={plan.href} className="mb-7">
                <Button
                  size="lg"
                  variant={plan.highlighted ? "secondary" : plan.ctaVariant}
                  className={`w-full rounded-full font-semibold ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90"
                      : ""
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Divider */}
              <div className={`h-px mb-6 ${plan.highlighted ? "bg-white/20" : "bg-border/60"}`} />

              {/* Features list */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? "bg-white/20" : "bg-primary/10"
                    }`}>
                      <Check className={`h-2.5 w-2.5 ${plan.highlighted ? "text-white" : "text-primary"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-white/85" : "text-muted-foreground"}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
