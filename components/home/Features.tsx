import {
  Phone, MessageSquare, Fingerprint, LayoutDashboard,
  Code2, ShieldCheck, Zap, Globe, Lock,
} from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "Real-time Call Analysis",
    description:
      "Analyze live calls as they happen. Detect AI-synthesized voices, voice cloning, and deepfake audio with sub-2-second latency.",
    size: "large",
    accent: true,
  },
  {
    icon: MessageSquare,
    title: "SMS Pattern Detection",
    description:
      "Identify phishing links, urgent-language scam patterns, and spoofed sender IDs across all SMS channels.",
    size: "normal",
  },
  {
    icon: Fingerprint,
    title: "Voice Fingerprinting",
    description:
      "Build trusted voice profiles for your executives and clients. Flag calls that don't match verified prints.",
    size: "normal",
  },
  {
    icon: LayoutDashboard,
    title: "Threat Dashboard",
    description:
      "A unified dashboard with real-time threat feeds, historical trend analysis, and team-wide alert management.",
    size: "normal",
  },
  {
    icon: Code2,
    title: "API Integration",
    description:
      "Drop-in REST API and webhooks. Integrate with your existing phone system, CRM, or communication stack in minutes.",
    size: "normal",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II certified. Data encrypted in transit and at rest. No call audio ever leaves your region.",
    size: "normal",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Unlock powerful features that drive results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to detect, block, and report AI-powered fraud — all in one platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isFirst = i === 0;
            return (
              <div
                key={feature.title}
                className={`group relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  isFirst
                    ? "lg:col-span-2 bg-primary text-primary-foreground"
                    : "bg-white border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                    isFirst ? "bg-white/20" : "bg-primary/10"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isFirst ? "text-white" : "text-primary"}`} />
                </div>

                {/* Content */}
                <h3
                  className={`text-lg font-bold mb-2.5 ${
                    isFirst ? "text-white" : "text-foreground"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isFirst ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {feature.description}
                </p>

                {/* Feature accent pills for the large card */}
                {isFirst && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {["< 2s latency", "99.2% accuracy", "Streaming API"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold bg-white/15 text-white px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover arrow */}
                {!isFirst && (
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
