"use client";

import { useState, useTransition } from "react";
import {
  MessageSquare,
  Loader2,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { analyzeSms } from "@/app/dashboard/actions";
import { RiskBadge, ScoreBar, formatDate } from "@/components/dashboard/shared";
import type { Scan, UserPlan } from "@/lib/database.types";

interface Props {
  plan: UserPlan;
  onScanComplete: (scan: Scan) => void;
  onCreditUsed: () => void;
}

export function SmsScanner({ plan, onScanComplete, onCreditUsed }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    scan: Scan;
    indicators: string[];
    suggestedAction: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = Math.max(0, plan.credits_total - plan.credits_used);
  const charCount = text.length;

  async function handleAnalyze() {
    if (!text.trim()) { setError("Please enter an SMS message to analyze."); return; }
    setError(null);
    const fd = new FormData();
    fd.append("text", text);

    startTransition(async () => {
      const res = await analyzeSms(fd);
      if (res.error === "no_credits") {
        setError("no_credits");
      } else if (res.error) {
        setError(res.error);
      } else if (res.success && res.scan) {
        setResult({
          scan: res.scan as Scan,
          indicators: res.indicators ?? [],
          suggestedAction: res.suggestedAction ?? "",
        });
        onScanComplete(res.scan as Scan);
        onCreditUsed();
      }
    });
  }

  function reset() {
    setText("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">SMS Fraud Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste any suspicious SMS or message to detect phishing, smishing, and scam patterns.
        </p>
      </div>

      {remaining <= 2 && remaining > 0 && (
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Only <strong>{remaining} credit{remaining !== 1 ? "s" : ""}</strong> remaining.
          </AlertDescription>
        </Alert>
      )}

      {error === "no_credits" ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6 space-y-4 text-center">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-semibold text-lg">No Credits Remaining</h3>
            <p className="text-sm text-muted-foreground">
              Upgrade your plan to continue scanning messages.
            </p>
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" /> Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      ) : result ? (
        // ─── Result ───
        <div className="space-y-4">
          <Card className={`border-2 ${
            result.scan.risk_level === "high"
              ? "border-red-500/40 bg-red-500/5"
              : result.scan.risk_level === "medium"
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-emerald-500/40 bg-emerald-500/5"
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    SMS Analysis Result
                  </CardTitle>
                  <CardDescription>{formatDate(result.scan.created_at)}</CardDescription>
                </div>
                <RiskBadge level={result.scan.risk_level} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar score={result.scan.fraud_score} risk={result.scan.risk_level} />

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Confidence:</span>
                <Badge variant="outline">{result.scan.confidence}%</Badge>
              </div>

              {/* Original message */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Analyzed Message</p>
                <p className="text-sm text-foreground leading-relaxed line-clamp-4">{result.scan.raw_input}</p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Explanation</p>
                <p className="text-sm leading-relaxed">{result.scan.explanation}</p>
              </div>

              {result.indicators.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Threat Indicators</p>
                  <div className="flex flex-wrap gap-2">
                    {result.indicators.map((ind) => (
                      <Badge key={ind} variant="outline" className="text-xs">{ind}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className={`rounded-lg p-3 text-sm font-medium ${
                result.scan.risk_level === "high"
                  ? "bg-red-500/10 text-red-600"
                  : result.scan.risk_level === "medium"
                  ? "bg-amber-500/10 text-amber-700"
                  : "bg-emerald-500/10 text-emerald-700"
              }`}>
                <span className="font-semibold">Suggested Action: </span>
                {result.suggestedAction}
              </div>

              <div className="text-xs text-muted-foreground">
                ✓ Saved to scan history automatically
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Scan Another Message
          </Button>
        </div>
      ) : (
        // ─── Input ───
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder="Paste suspicious SMS or message here…&#10;&#10;Example: URGENT! Your account has been suspended. Click here to verify: bit.ly/verify123"
              className="min-h-[180px] resize-none text-sm leading-relaxed pr-4"
              maxLength={5000}
            />
            <div className="absolute bottom-2.5 right-3 text-xs text-muted-foreground">
              {charCount}/5000
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2">
            <p className="text-xs text-muted-foreground self-center">Try an example:</p>
            {[
              "Your bank account is suspended. Verify now: bit.ly/bank123",
              "Hi! You won a $500 gift card. Claim at tinyurl.com/free",
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => setText(ex)}
                className="text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {ex.slice(0, 35)}…
              </button>
            ))}
          </div>

          {error && error !== "no_credits" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!text.trim() || isPending || remaining === 0}
            className="w-full h-11 gap-2 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Message…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analyze for Fraud
                <Badge variant="secondary" className="ml-1 text-xs">1 credit</Badge>
              </>
            )}
          </Button>
          {remaining === 0 && (
            <p className="text-center text-xs text-red-500">No credits remaining. Upgrade to continue.</p>
          )}
        </div>
      )}
    </div>
  );
}
