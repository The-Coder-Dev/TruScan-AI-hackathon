"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 40,
    suffix: "%",
    label: "Fewer fraud cases",
    description: "Teams using TruScan AI report dramatically fewer successful fraud incidents within 30 days.",
  },
  {
    value: 3,
    suffix: "x",
    label: "Faster detection",
    description: "Our AI identifies threats 3x faster than traditional rule-based security systems.",
  },
  {
    value: 99.2,
    suffix: "%",
    label: "Accuracy rate",
    description: "Industry-leading accuracy across deepfake call detection and SMS scam classification.",
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(parseFloat(current.toFixed(1)));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-6xl font-bold text-foreground tabular-nums">
      {count % 1 === 0 ? count.toFixed(0) : count.toFixed(1)}
      {suffix}
    </div>
  );
}

export function Metrics() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            Metrics
          </span>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Track what matters for real growth
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor, analyze, and boost your protection with AI-powered insights.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative group bg-white rounded-3xl border border-border/60 p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Accent dot */}
              <div className="w-2 h-2 rounded-full bg-primary mb-6" />

              <AnimatedCounter target={stat.value} suffix={stat.suffix} />

              <p className="text-lg font-semibold text-foreground mt-2 mb-3">{stat.label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>

              {/* Subtle grid decoration */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full bg-primary/30" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
