import { Upload, Cpu, BellRing } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Connect or Upload",
    description:
      "Integrate via our REST API, webhooks, or upload call recordings and SMS logs directly to the dashboard.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analyzes in Real-time",
    description:
      "Our multi-layer AI engine checks voice biometrics, speech synthesis patterns, SMS linguistic markers, and known scam signatures simultaneously.",
  },
  {
    number: "03",
    icon: BellRing,
    title: "Get Instant Alerts",
    description:
      "Receive instant risk scores with full explainability — block, quarantine, or flag threats automatically before your team sees them.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Get started in 3 simple steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Effortlessly connect, analyze, and protect your communications — no complex setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Number + icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-md transition-all duration-300">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
