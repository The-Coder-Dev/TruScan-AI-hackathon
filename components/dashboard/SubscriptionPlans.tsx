"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles, Loader2, Crown, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { upgradePlan } from "@/app/dashboard/actions";
import type { UserPlan } from "@/lib/database.types";

interface Props {
  plan: UserPlan;
  onUpgrade: (plan: UserPlan) => void;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Shield,
    color: "text-muted-foreground",
    iconBg: "bg-secondary",
    credits: 10,
    description: "Perfect for individuals getting started",
    features: ["10 total scans", "Audio deepfake detection", "SMS scam detection", "Basic scan history", "Email support"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    icon: Zap,
    color: "text-primary",
    iconBg: "bg-primary/10",
    credits: 100,
    description: "For teams that need reliable fraud protection",
    features: ["100 scans/month", "Priority analysis", "Full scan history", "Advanced AI explanations", "Priority support", "Monthly credit reset"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "/month",
    icon: Crown,
    color: "text-amber-500",
    iconBg: "bg-amber-500/10",
    credits: 9999,
    description: "Protection for large organizations",
    features: ["Unlimited scans", "Team collaboration", "Advanced analytics", "API access", "Dedicated account manager", "SLA guarantees"],
    highlighted: false,
  },
];

export function SubscriptionPlans({ plan, onUpgrade }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = Math.max(0, plan.credits_total - plan.credits_used);
  const usedPct = Math.round((plan.credits_used / plan.credits_total) * 100);

  function handleUpgrade(planId: "pro" | "enterprise") {
    setError(null);
    setSuccess(null);
    setUpgrading(planId);
    startTransition(async () => {
      const res = await upgradePlan(planId);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Successfully upgraded to ${planId === "pro" ? "Pro" : "Enterprise"}!`);
        const newCredits = planId === "pro" ? 100 : 9999;
        onUpgrade({ ...plan, plan: planId, credits_total: newCredits, credits_used: 0 });
      }
      setUpgrading(null);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose the right plan for your fraud detection needs.</p>
      </div>

      {/* Current usage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Usage</CardTitle>
            <Badge className="capitalize">{plan.plan} Plan</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credits used</span>
            <span className="font-semibold">{plan.credits_used} / {plan.plan === "enterprise" ? "∞" : plan.credits_total}</span>
          </div>
          {plan.plan !== "enterprise" && (
            <Progress value={usedPct} className={`h-2 ${usedPct > 80 ? "[&>div]:bg-red-500" : usedPct > 50 ? "[&>div]:bg-amber-500" : ""}`} />
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={`font-bold ${remaining <= 2 ? "text-red-500" : "text-emerald-600"}`}>
              {plan.plan === "enterprise" ? "Unlimited" : `${remaining} credits`}
            </span>
          </div>
          {plan.reset_at && (
            <p className="text-xs text-muted-foreground">
              Resets on {new Date(plan.reset_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          )}
        </CardContent>
      </Card>

      {success && (
        <Alert className="border-emerald-500/40 bg-emerald-500/10">
          <Check className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">{success}</AlertDescription>
        </Alert>
      )}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const isCurrent = plan.plan === p.id;
          const canUpgrade = (p.id === "pro" && plan.plan === "free") || (p.id === "enterprise" && plan.plan !== "enterprise");

          return (
            <Card
              key={p.id}
              className={`relative flex flex-col transition-all ${p.highlighted ? "border-primary shadow-lg ring-1 ring-primary/20" : ""} ${isCurrent ? "bg-secondary/30" : ""}`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">
                    <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center mb-1`}>
                  <Icon className={`w-5 h-5 ${p.color}`} />
                </div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <CardDescription className="text-xs">{p.description}</CardDescription>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {p.id === "enterprise" ? "Unlimited" : `${p.credits.toLocaleString()} credits`}{p.id !== "free" ? "/month" : " total"}
                </p>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="w-4 h-4 mr-2" /> Current Plan
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    className="w-full gap-2"
                    variant={p.highlighted ? "default" : "outline"}
                    onClick={() => handleUpgrade(p.id as "pro" | "enterprise")}
                    disabled={isPending}
                  >
                    {upgrading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    Upgrade to {p.name}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full text-muted-foreground" disabled>
                    Downgrade not available
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Demo app — no real payments processed. Plan upgrades are simulated.
      </p>
    </div>
  );
}
