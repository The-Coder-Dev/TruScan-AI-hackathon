"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, BarChart3, Phone, AlertTriangle, Wifi, Activity } from "lucide-react";
import { useEffect, useRef } from "react";

const trustStats = [
  { icon: BarChart3, value: "10M+", label: "Calls analyzed" },
  { icon: CheckCircle2, value: "99.2%", label: "Accuracy rate" },
  { icon: Zap, value: "< 2s", label: "Detection speed" },
];

export function HeroSection() {
  const waveRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      if (!waveRef.current) return;
      frame += 0.04;
      const points = Array.from({ length: 50 }, (_, i) => {
        const x = (i / 49) * 260;
        const y = 18 + Math.sin(i * 0.5 + frame) * (i > 15 && i < 35 ? 12 : 3);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      });
      waveRef.current.setAttribute("d", points.join(" "));
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Warm radial background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Copy */}
          <div className="flex flex-col gap-7">
            {/* Badge pill */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Detect Deepfake calls and fraud SMS
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Detect{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">Deepfake Calls & SMS Scams</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/10 rounded z-0" />
              </span>{" "}
              Instantly with AI
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Protect your business and personal communications with enterprise-grade real-time AI analysis.
              Stop fraudsters before they cause damage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 font-semibold shadow-md hover:shadow-lg transition-all group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-7 font-semibold border-border hover:bg-secondary transition-all"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {trustStats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Hero Visual */}
          <div className="relative flex items-center justify-center">
            {/* Glow ring */}
            <div className="absolute w-[440px] h-[440px] rounded-full border border-primary/10 animate-pulse" />
            <div className="absolute w-[380px] h-[380px] rounded-full bg-primary/5 blur-xl" />

            {/* Main card */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/8 border border-border/60 p-6 w-full max-w-sm z-10">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Incoming Call</p>
                    <p className="text-xs text-muted-foreground">+1 (555) 284-9034</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 font-semibold px-2.5 py-1 rounded-full border border-red-100">
                  <AlertTriangle className="h-3 w-3" />
                  DEEPFAKE
                </span>
              </div>

              {/* Waveform */}
              <div className="bg-secondary/50 rounded-2xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-primary" />
                  Voice Pattern Analysis
                </p>
                <svg className="w-full h-9" viewBox="0 0 260 36" fill="none">
                  <path
                    ref={waveRef}
                    d="M 0 18"
                    stroke="hsl(39 100% 57%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Detection scores */}
              <div className="space-y-3">
                {[
                  { label: "Voice Authenticity", value: 12, color: "bg-red-400", bad: true },
                  { label: "Speech Pattern", value: 18, color: "bg-orange-400", bad: true },
                  { label: "Background Noise", value: 71, color: "bg-emerald-400", bad: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${item.bad ? "text-red-500" : "text-emerald-600"}`}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Risk badge */}
              <div className="mt-5 bg-red-50 rounded-2xl px-4 py-3 border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-700">Risk Score</p>
                  <p className="text-xl font-bold text-red-600">88 / 100</p>
                </div>
                <div className="text-xs text-red-600 font-medium bg-red-100 px-3 py-1.5 rounded-full">
                  High Risk — Block
                </div>
              </div>

              {/* Floating ping badge */}
              <div className="absolute -top-3 -right-3 bg-white rounded-full shadow-lg border border-border px-3 py-1.5 flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-foreground">Live AI</span>
              </div>
            </div>

            {/* SMS scam mini-card */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-border/60 px-4 py-3 max-w-[200px] z-20">
              <p className="text-xs font-semibold text-foreground mb-1">SMS Scan</p>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                "URGENT: Your bank account is locked. Click now to verify…"
              </p>
              <div className="mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-500">SCAM DETECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
