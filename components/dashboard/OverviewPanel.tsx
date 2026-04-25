"use client";

import { useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Activity, AlertTriangle, CheckCircle, Zap,
  TrendingUp, Shield, Mic, MessageSquare, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RiskBadge, ScanTypeIcon, ScoreBar, formatDate } from "@/components/dashboard/shared";
import type { Scan, UserPlan } from "@/lib/database.types";

interface Props {
  user: User;
  plan: UserPlan;
  scans: Scan[];
  onNavigate: (tab: string) => void;
}

export function OverviewPanel({ user, plan, scans, onNavigate }: Props) {
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const remaining = Math.max(0, plan.credits_total - plan.credits_used);
  const usedPct = plan.plan === "enterprise" ? 10 : Math.round((plan.credits_used / plan.credits_total) * 100);

  const stats = useMemo(() => {
    const total = scans.length;
    const threats = scans.filter((s) => s.risk_level === "high").length;
    const safe = scans.filter((s) => s.risk_level === "low").length;
    const audioScans = scans.filter((s) => s.type === "audio").length;
    const smsScans = scans.filter((s) => s.type === "sms").length;
    return { total, threats, safe, audioScans, smsScans };
  }, [scans]);

  const recentScans = scans.slice(0, 5);

  const protectionScore =
    stats.total === 0
      ? 100
      : Math.round(((stats.total - stats.threats) / stats.total) * 100);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s your fraud protection overview.
          </p>
        </div>
        <Badge className="capitalize hidden sm:flex gap-1" variant="outline">
          <CreditCard className="w-3 h-3" />
          {plan.plan} Plan
        </Badge>
      </div>

      {/* Credit bar */}
      <Card className={remaining <= 2 ? "border-red-500/30 bg-red-500/5" : ""}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Credits</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${remaining <= 2 ? "text-red-500" : "text-foreground"}`}>
                {plan.plan === "enterprise" ? "Unlimited" : `${remaining} remaining`}
              </span>
              {remaining <= 2 && plan.plan !== "enterprise" && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onNavigate("plans")}>
                  Upgrade
                </Button>
              )}
            </div>
          </div>
          {plan.plan !== "enterprise" && (
            <Progress
              value={usedPct}
              className={`h-2 ${usedPct > 80 ? "[&>div]:bg-red-500" : usedPct > 50 ? "[&>div]:bg-amber-500" : ""}`}
            />
          )}
          {plan.plan !== "enterprise" && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {plan.credits_used} of {plan.credits_total} credits used
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Scans",
            value: stats.total,
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            note: stats.total === 0 ? "No scans yet" : `${stats.audioScans} audio, ${stats.smsScans} SMS`,
          },
          {
            label: "Threats Found",
            value: stats.threats,
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-500/10",
            note: stats.threats > 0 ? "High risk results" : "None detected",
          },
          {
            label: "Safe Results",
            value: stats.safe,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            note: "Low risk results",
          },
          {
            label: "Protection Score",
            value: `${protectionScore}%`,
            icon: Shield,
            color: protectionScore >= 80 ? "text-emerald-500" : "text-amber-500",
            bg: protectionScore >= 80 ? "bg-emerald-500/10" : "bg-amber-500/10",
            note: protectionScore >= 80 ? "Excellent" : "Needs attention",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:border-border/80 transition-colors">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.note}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent scans + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent scans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Scans</CardTitle>
              {scans.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7"
                  onClick={() => onNavigate("history")}
                >
                  View all
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {recentScans.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No scans yet. Start scanning!</p>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate("audio")}>
                      <Mic className="w-3.5 h-3.5" /> Audio
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate("sms")}>
                      <MessageSquare className="w-3.5 h-3.5" /> SMS
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors">
                      <ScanTypeIcon type={scan.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{scan.label}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(scan.created_at)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <RiskBadge level={scan.risk_level} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions + Protection score */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gap-2 justify-start"
                onClick={() => onNavigate("audio")}
                disabled={remaining === 0 && plan.plan !== "enterprise"}
              >
                <Mic className="w-4 h-4" /> Scan Audio File
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={() => onNavigate("sms")}
                disabled={remaining === 0 && plan.plan !== "enterprise"}
              >
                <MessageSquare className="w-4 h-4" /> Scan SMS Message
              </Button>
              {remaining === 0 && plan.plan !== "enterprise" && (
                <Button
                  variant="secondary"
                  className="w-full gap-2 justify-start text-primary"
                  onClick={() => onNavigate("plans")}
                >
                  <Zap className="w-4 h-4" /> Upgrade Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Protection score widget */}
          <div className="bg-gradient-to-br from-primary/90 to-violet-600 rounded-xl p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium">Protection Score</p>
                <p className="text-3xl font-bold mt-0.5">{protectionScore}%</p>
                <p className="text-white/60 text-xs mt-0.5">
                  {protectionScore >= 90 ? "Excellent" : protectionScore >= 70 ? "Good" : "Needs attention"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 bg-white/10 rounded-lg h-1.5">
              <div
                className="bg-white rounded-lg h-1.5 transition-all"
                style={{ width: `${protectionScore}%` }}
              />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">
                {stats.total} scan{stats.total !== 1 ? "s" : ""} total
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
