"use client";

import { useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Shield, LayoutDashboard, Mic, MessageSquare, History,
  CreditCard, Settings, LogOut, Bell, Menu, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { signOut } from "@/app/auth/actions";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { AudioScanner } from "@/components/dashboard/AudioScanner";
import { SmsScanner } from "@/components/dashboard/SmsScanner";
import { ScanHistory } from "@/components/dashboard/ScanHistory";
import { SubscriptionPlans } from "@/components/dashboard/SubscriptionPlans";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import type { Scan, UserPlan } from "@/lib/database.types";

interface Props {
  user: User;
  initialPlan: UserPlan;
  initialScans: Scan[];
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Mic, label: "Audio Scanner", id: "audio" },
  { icon: MessageSquare, label: "SMS Scanner", id: "sms" },
  { icon: History, label: "Scan History", id: "history" },
  { icon: CreditCard, label: "Plans", id: "plans" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export function DashboardClient({ user, initialPlan, initialScans }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plan, setPlan] = useState<UserPlan>(initialPlan);
  const [scans, setScans] = useState<Scan[]>(initialScans);

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const remaining = Math.max(0, plan.credits_total - plan.credits_used);
  const creditPct = plan.plan === "enterprise" ? 10 : Math.round((plan.credits_used / plan.credits_total) * 100);

  const handleScanComplete = useCallback((scan: Scan) => {
    setScans((prev) => [scan, ...prev]);
  }, []);

  const handleCreditUsed = useCallback(() => {
    setPlan((prev) => ({
      ...prev,
      credits_used: Math.min(prev.credits_used + 1, prev.credits_total),
    }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setScans((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleUpgrade = useCallback((newPlan: UserPlan) => {
    setPlan(newPlan);
  }, []);

  const navigate = useCallback((tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            TruScan<span className="text-primary">AI</span>
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground p-1 rounded-md hover:bg-secondary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Credit mini bar */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Credits</span>
            </div>
            <span className={`text-xs font-bold ${remaining <= 2 ? "text-red-500" : "text-foreground"}`}>
              {plan.plan === "enterprise" ? "∞" : remaining}
            </span>
          </div>
          {plan.plan !== "enterprise" && (
            <Progress
              value={creditPct}
              className={`h-1.5 ${creditPct > 80 ? "[&>div]:bg-red-500" : creditPct > 50 ? "[&>div]:bg-amber-500" : ""}`}
            />
          )}
          <Badge variant="outline" className="mt-2 text-[10px] capitalize w-full justify-center">
            {plan.plan} Plan
          </Badge>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.id === "history" && scans.length > 0 && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {scans.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="border-t border-border p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-sm h-9"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-5 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </p>
          </div>

          {/* Credits pill (desktop) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className={remaining <= 2 ? "text-red-500 font-bold" : ""}>
              {plan.plan === "enterprise" ? "Unlimited" : `${remaining} credits`}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Bell className="w-4 h-4" />
            {remaining <= 2 && plan.plan !== "enterprise" && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>

          <Avatar className="w-7 h-7 cursor-pointer shrink-0" onClick={() => navigate("settings")}>
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <OverviewPanel
              user={user}
              plan={plan}
              scans={scans}
              onNavigate={navigate}
            />
          )}
          {activeTab === "audio" && (
            <AudioScanner
              plan={plan}
              onScanComplete={handleScanComplete}
              onCreditUsed={handleCreditUsed}
            />
          )}
          {activeTab === "sms" && (
            <SmsScanner
              plan={plan}
              onScanComplete={handleScanComplete}
              onCreditUsed={handleCreditUsed}
            />
          )}
          {activeTab === "history" && (
            <ScanHistory
              scans={scans}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "plans" && (
            <SubscriptionPlans
              plan={plan}
              onUpgrade={handleUpgrade}
            />
          )}
          {activeTab === "settings" && (
            <SettingsPanel user={user} plan={plan} />
          )}
        </main>
      </div>
    </div>
  );
}
