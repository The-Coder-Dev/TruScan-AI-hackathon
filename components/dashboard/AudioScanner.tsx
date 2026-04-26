"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import {
  Upload,
  Mic,
  FileAudio,
  X,
  Play,
  Pause,
  Loader2,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { analyzeAudio } from "@/app/dashboard/actions";
import { RiskBadge, ScoreBar, formatDate } from "@/components/dashboard/shared";
import type { Scan } from "@/lib/database.types";
import type { UserPlan } from "@/lib/database.types";

interface Props {
  plan: UserPlan;
  onScanComplete: (scan: Scan) => void;
  onCreditUsed: () => void;
}

export function AudioScanner({ plan, onScanComplete, onCreditUsed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ scan: Scan; indicators: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const remaining = Math.max(0, plan.credits_total - plan.credits_used);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  function validateAndSet(f: File) {
    setError(null);
    setResult(null);
    if (!f.type.startsWith("audio/") && !f.name.match(/\.(mp3|wav|ogg|m4a|flac|webm)$/i)) {
      setError("Unsupported file. Please upload MP3, WAV, OGG, M4A, or FLAC.");
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError("File too large. Maximum 25 MB allowed.");
      return;
    }
    setFile(f);
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(f);
    }
  }

  function togglePlay() {
    if (!audioRef.current || !file) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  async function handleAnalyze() {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("audio", file);

    // Simulate upload progress
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p >= 85 ? p : p + Math.random() * 15));
    }, 300);

    startTransition(async () => {
      const res = await analyzeAudio(fd);
      clearInterval(interval);
      setProgress(100);
      if (res.error === "no_credits") {
        setError("no_credits");
      } else if (res.error) {
        setError(res.error);
      } else if (res.success && res.scan) {
        setResult({ scan: res.scan as Scan, indicators: res.indicators ?? [] });
        onScanComplete(res.scan as Scan);
        onCreditUsed();
      }
    });
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setPlaying(false);
    if (audioRef.current) audioRef.current.src = "";
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Audio Fraud Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a call recording or voice message to detect deepfakes and robocalls.
        </p>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      {/* Credits warning */}
      {remaining <= 2 && remaining > 0 && (
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            You have only <strong>{remaining} credit{remaining !== 1 ? "s" : ""}</strong> remaining.
            Consider upgrading your plan.
          </AlertDescription>
        </Alert>
      )}

      {error === "no_credits" ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6 space-y-4 text-center">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-semibold text-lg">No Credits Remaining</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ve used all your free credits. Upgrade to continue scanning.
            </p>
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" /> Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      ) : result ? (
        // ─── Result Card ───
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
                    <FileAudio className="w-4 h-4 text-violet-500" />
                    {result.scan.label}
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

              <div className="text-xs text-muted-foreground">
                ✓ Saved to scan history automatically
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={reset} className="gap-2">
            <Upload className="w-4 h-4" /> Scan Another File
          </Button>
        </div>
      ) : (
        // ─── Upload Zone ───
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl transition-all cursor-pointer
              ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-secondary/30"}
              ${file ? "cursor-default" : ""}
            `}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
            />

            {!file ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Drag & drop audio file</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <div className="flex gap-2 mt-1">
                  {["MP3", "WAV", "OGG", "M4A", "FLAC"].map((ext) => (
                    <Badge key={ext} variant="outline" className="text-xs">{ext}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Max 25 MB</p>
              </div>
            ) : (
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <FileAudio className="w-6 h-6 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isPending && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Analyzing…</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    disabled={isPending}
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    disabled={isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && error !== "no_credits" && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || isPending || remaining === 0}
            className="w-full h-11 gap-2 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Audio…
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
