"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Shield,
  LayoutDashboard,
  Mic,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/app/auth/actions";
import { Progress } from "@/components/ui/progress";

interface Props {
  user: User;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Mic, label: "Audio Analysis", id: "audio" },
  { icon: MessageSquare, label: "SMS / Email", id: "sms" },
  { icon: BarChart3, label: "Reports", id: "reports" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const recentScans = [
  {
    id: 1,
    type: "audio",
    label: "CEO call recording",
    risk: 94,
    status: "threat",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "sms",
    label: "Bank OTP SMS",
    risk: 12,
    status: "safe",
    time: "14 min ago",
  },
  {
    id: 3,
    type: "audio",
    label: "Support call #2841",
    risk: 61,
    status: "warning",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "email",
    label: "Invoice from vendor",
    risk: 78,
    status: "threat",
    time: "3 hr ago",
  },
  {
    id: 5,
    type: "sms",
    label: "Delivery notification",
    risk: 8,
    status: "safe",
    time: "5 hr ago",
  },
];

function getRiskColor(risk: number) {
  if (risk >= 70) return "text-red-500";
  if (risk >= 40) return "text-amber-500";
  return "text-emerald-500";
}

function getRiskBg(risk: number) {
  if (risk >= 70) return "bg-red-500";
  if (risk >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStatusBadge(status: string) {
  if (status === "threat")
    return (
      <Badge className="bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/20">
        Threat
      </Badge>
    );
  if (status === "warning")
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
        Warning
      </Badge>
    );
  return (
    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
      Safe
    </Badge>
  );
}

export function DashboardClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (
    user.user_metadata?.full_name ||
    user.email ||
    "U"
  )
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            TruScan<span className="text-primary">AI</span>
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-6xl">
              {/* Welcome */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {displayName.split(" ")[0]} 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Here&apos;s your fraud detection summary for today.
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Scans",
                    value: "1,284",
                    delta: "+12%",
                    up: true,
                    icon: Activity,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Threats Blocked",
                    value: "47",
                    delta: "+3",
                    up: true,
                    icon: AlertTriangle,
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                  },
                  {
                    label: "Safe Verified",
                    value: "1,193",
                    delta: "+9%",
                    up: true,
                    icon: CheckCircle,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    label: "Avg. Scan Time",
                    value: "0.28s",
                    delta: "-4ms",
                    up: true,
                    icon: Zap,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-card border border-border rounded-xl p-5 space-y-3 hover:border-border/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </span>
                        <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${
                            stat.up ? "text-emerald-500" : "text-red-500"
                          }`}
                        >
                          {stat.up ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {stat.delta}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Scans */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Recent Scans</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    View all
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          scan.type === "audio"
                            ? "bg-violet-500/10"
                            : scan.type === "sms"
                            ? "bg-blue-500/10"
                            : "bg-orange-500/10"
                        }`}
                      >
                        {scan.type === "audio" ? (
                          <Mic className="w-4 h-4 text-violet-500" />
                        ) : (
                          <MessageSquare
                            className={`w-4 h-4 ${
                              scan.type === "sms"
                                ? "text-blue-500"
                                : "text-orange-500"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {scan.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{scan.time}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-24 hidden sm:block">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-xs font-semibold ${getRiskColor(scan.risk)}`}>
                              {scan.risk}%
                            </span>
                          </div>
                          <Progress
                            value={scan.risk}
                            className="h-1.5"
                          />
                        </div>
                        {getStatusBadge(scan.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protection score */}
              <div className="bg-gradient-to-br from-primary/90 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium">Protection Score</p>
                    <p className="text-4xl font-bold mt-1">98.4%</p>
                    <p className="text-white/60 text-xs mt-1">
                      Excellent — your organization is well protected
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-lg h-2">
                  <div
                    className="bg-white rounded-lg h-2 transition-all"
                    style={{ width: "98.4%" }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
                  {(() => {
                    const item = navItems.find((n) => n.id === activeTab);
                    const Icon = item?.icon ?? LayoutDashboard;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <p className="font-medium text-foreground">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  This section is coming soon.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
