"use client";

import { useState, useRef, useCallback } from "react";
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
  MessageSquare,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RiskBadge, ScoreBar, formatDate } from "@/components/dashboard/shared";
import type { Scan, UserPlan } from "@/lib/database.types";

interface Props {
  plan: UserPlan;
  onScanComplete: (scan: Scan) => void;
  onCreditUsed: () => void;
}

interface AudioResult {
  scan: Scan;
  transcript: string;
  deepfake_score: number;
  fraud_score: number;
  indicators: string[];
  suggested_action: string;
}

export function AudioScanner({ plan, onScanComplete, onCreditUsed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [stage, setStage] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = Math.max(0, plan.credits_total - plan.credits_used);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validateAndSet(f: File) {
    setError(null);
    setResult(null);
    if (
      !f.type.startsWith("audio/") &&
      !f.type.startsWith("video/mp4") &&
      !f.name.match(/\.(mp3|wav|ogg|m4a|mp4|flac|webm|aac)$/i)
    ) {
      setError("Unsupported file. Please upload MP3, WAV, M4A, MP4, OGG, or FLAC.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File too large. Maximum 20 MB allowed.");
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
    setIsLoading(true);
    setProgress(0);
    setStage("Uploading audio…");

    // Simulate realistic progress stages while waiting for the real API
    const stages = [
      { at: 10, label: "Transcribing with Whisper AI…" },
      { at: 40, label: "Analyzing fraud intent with Llama…" },
      { at: 70, label: "Deepfake detection via Reality Defender…" },
      { at: 90, label: "Merging analysis results…" },
    ];
    let stageIdx = 0;

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p >= 88 ? p : p + Math.random() * 6;
        if (stageIdx < stages.length && next >= stages[stageIdx].at) {
          setStage(stages[stageIdx].label);
          stageIdx++;
        }
        return next;
      });
    }, 400);

    try {
      const fd = new FormData();
      fd.append("audio", file);

      const res = await fetch("/api/analyze-audio", {
        method: "POST",
        body: fd,
      });

      clearInterval(intervalRef.current!);
      setProgress(100);

      const data = await res.json() as {
        success?: boolean;
        error?: string;
        scan?: Scan;
        transcript?: string;
        deepfake_score?: number;
        fraud_score?: number;
        risk_level?: string;
        summary?: string;
        suggested_action?: string;
        indicators?: string[];
      };

      if (!res.ok || data.error) {
        if (data.error === "no_credits") {
          setError("no_credits");
        } else {
          setError(data.error ?? "Analysis failed. Please try again.");
        }
        return;
      }

      if (data.success && data.scan) {
        setResult({
          scan: data.scan,
          transcript: data.transcript ?? "",
          deepfake_score: data.deepfake_score ?? 50,
          fraud_score: data.fraud_score ?? 0,
          indicators: data.indicators ?? [],
          suggested_action: data.suggested_action ?? "",
        });
        onScanComplete(data.scan);
        onCreditUsed();
      }
    } catch {
      clearInterval(intervalRef.current!);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setStage("");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setPlaying(false);
    setStage("");
    if (audioRef.current) audioRef.current.src = "";
  }

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-bold">Audio Fraud Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a call recording or voice message to detect deepfakes and robocalls.
        </p>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />

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

              {/* Dual scores: Fraud + Deepfake */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fraud Score
                  </p>
                  <ScoreBar score={result.fraud_score} risk={result.scan.risk_level} />
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Deepfake Score
                  </p>
                  <ScoreBar
                    score={result.deepfake_score}
                    risk={result.deepfake_score >= 65 ? "high" : result.deepfake_score >= 30 ? "medium" : "low"}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Confidence:</span>
                <Badge variant="outline">{result.scan.confidence}%</Badge>
                <span className="text-muted-foreground ml-2">Powered by:</span>
                <Badge variant="outline" className="text-xs gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Whisper · Llama · Reality Defender
                </Badge>
              </div>

              {/* Transcript */}
              {result.transcript && (
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Transcript
                  </p>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-5 italic">
                    &ldquo;{result.transcript}&rdquo;
                  </p>
                </div>
              )}

              {/* AI Summary */}
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

              {/* Suggested action */}
              {result.suggested_action && (
                <div className={`rounded-lg p-3 text-sm font-medium ${
                  result.scan.risk_level === "high"
                    ? "bg-red-500/10 text-red-600"
                    : result.scan.risk_level === "medium"
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-emerald-500/10 text-emerald-700"
                }`}>
                  <span className="font-semibold">Suggested Action: </span>
                  {result.suggested_action}
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
              accept="audio/*,.mp4"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && validateAndSet(e.target.files[0])}
            />

            {!file ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mic className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Drag &amp; drop audio file</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <div className="flex gap-2 mt-1">
                  {["MP3", "WAV", "M4A", "MP4", "OGG", "FLAC"].map((ext) => (
                    <Badge key={ext} variant="outline" className="text-xs">{ext}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Max 20 MB</p>
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
                  {isLoading && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{stage || "Processing…"}</span>
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
                    disabled={isLoading}
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    disabled={isLoading}
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
            disabled={!file || isLoading || remaining === 0}
            className="w-full h-11 gap-2 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {stage || "Analyzing Audio…"}
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
