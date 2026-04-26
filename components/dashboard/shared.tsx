import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Scan } from "@/lib/database.types";
import { Mic, MessageSquare, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

export function getRiskColor(risk: string) {
  if (risk === "high") return "text-red-500";
  if (risk === "medium") return "text-amber-500";
  return "text-emerald-500";
}

export function getRiskBg(risk: string) {
  if (risk === "high") return "bg-red-500";
  if (risk === "medium") return "bg-amber-500";
  return "bg-emerald-500";
}

export function RiskBadge({ level }: { level: string }) {
  if (level === "high")
    return (
      <Badge className="bg-red-500/15 text-red-500 border-red-500/30 hover:bg-red-500/20 gap-1">
        <ShieldAlert className="w-3 h-3" /> High Risk
      </Badge>
    );
  if (level === "medium")
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 gap-1">
        <ShieldQuestion className="w-3 h-3" /> Medium Risk
      </Badge>
    );
  return (
    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 gap-1">
      <ShieldCheck className="w-3 h-3" /> Low Risk
    </Badge>
  );
}

export function ScanTypeIcon({ type }: { type: string }) {
  return type === "audio" ? (
    <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
      <Mic className="w-4 h-4 text-violet-500" />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
      <MessageSquare className="w-4 h-4 text-blue-500" />
    </div>
  );
}

export function ScoreBar({ score, risk }: { score: number; risk: string }) {
  const color =
    risk === "high"
      ? "[&>div]:bg-red-500"
      : risk === "medium"
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Fraud Score</span>
        <span className={`font-bold ${getRiskColor(risk)}`}>{score}%</span>
      </div>
      <Progress value={score} className={`h-2 ${color}`} />
    </div>
  );
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function creditsRemaining(plan: { credits_total: number; credits_used: number }) {
  return Math.max(0, plan.credits_total - plan.credits_used);
}
