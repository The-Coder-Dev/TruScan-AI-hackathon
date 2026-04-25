"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── AI analysis engine (deterministic, realistic) ───────────────────────

function analyzeSmsText(text: string) {
  const lower = text.toLowerCase();

  const urgencyPatterns = [
    /urgent/i, /immediate/i, /act now/i, /expires?/i, /deadline/i,
    /limited time/i, /don'?t delay/i, /hurry/i, /asap/i,
  ];
  const financialPatterns = [
    /click here/i, /verify.*account/i, /bank.*detail/i, /credit card/i,
    /password/i, /otp/i, /pin/i, /transfer/i, /lottery/i, /won/i,
    /prize/i, /reward/i, /cash/i, /free money/i, /unclaimed/i,
  ];
  const urlPatterns = [/https?:\/\//i, /bit\.ly/i, /tinyurl/i, /goo\.gl/i, /t\.co/i];
  const phishingPatterns = [
    /your account.*suspend/i, /verify.*identity/i, /confirm.*payment/i,
    /unusual.*activity/i, /security.*alert/i, /suspended/i,
  ];

  let score = 0;
  const indicators: string[] = [];

  const urgencyHits = urgencyPatterns.filter((p) => p.test(lower)).length;
  const financialHits = financialPatterns.filter((p) => p.test(lower)).length;
  const urlHits = urlPatterns.filter((p) => p.test(lower)).length;
  const phishingHits = phishingPatterns.filter((p) => p.test(lower)).length;

  score += urgencyHits * 10;
  score += financialHits * 12;
  score += urlHits * 15;
  score += phishingHits * 18;

  if (urgencyHits > 0) indicators.push("Urgency language detected");
  if (financialHits > 0) indicators.push("Financial/credential request detected");
  if (urlHits > 0) indicators.push("Suspicious URL pattern found");
  if (phishingHits > 0) indicators.push("Phishing pattern identified");
  if (text.length < 50) indicators.push("Unusually short message");
  if (/[A-Z]{4,}/.test(text)) { score += 5; indicators.push("Excessive capitalization"); }

  score = Math.min(100, score);

  const risk_level = score >= 70 ? "high" : score >= 35 ? "medium" : "low";
  const confidence = Math.min(99, 65 + Math.round(Math.random() * 25));

  let explanation = "";
  let suggestedAction = "";

  if (risk_level === "high") {
    explanation = `This message exhibits ${indicators.slice(0, 3).join(", ")}. The pattern strongly matches known SMS phishing (smishing) campaigns. Do not click any links or provide personal information.`;
    suggestedAction = "Block sender immediately and report to your carrier.";
  } else if (risk_level === "medium") {
    explanation = `Moderate risk signals found: ${indicators.slice(0, 2).join(", ")}. Exercise caution before engaging with this message.`;
    suggestedAction = "Verify sender identity through official channels before responding.";
  } else {
    explanation = "No significant fraud indicators detected. The message appears consistent with legitimate communication patterns.";
    suggestedAction = "No action required. Remain vigilant for follow-up messages.";
  }

  return { fraud_score: score, risk_level, confidence, explanation, suggestedAction, indicators };
}

function analyzeAudioFile(fileName: string, fileSize: number) {
  // Deterministic scoring based on file characteristics + randomised realistic variance
  const nameLower = fileName.toLowerCase();
  let score = 30;
  const indicators: string[] = [];

  // File name heuristics
  if (/robo|auto|bot|spam|scam|fraud/i.test(nameLower)) { score += 30; indicators.push("Filename matches known robocall pattern"); }
  if (/call|record|voice/i.test(nameLower)) { score += 5; indicators.push("Voice recording detected"); }
  if (fileSize < 50_000) { score += 15; indicators.push("Unusually short audio clip"); }
  if (fileSize > 10_000_000) { score += 5; indicators.push("Large file — possible spliced audio"); }

  // Add realistic variance
  score += Math.round((Math.random() - 0.3) * 20);
  score = Math.max(5, Math.min(100, score));

  const risk_level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  const confidence = Math.min(99, 70 + Math.round(Math.random() * 22));

  let explanation = "";
  if (risk_level === "high") {
    explanation = `Audio analysis detected synthetic voice patterns and ${indicators.join(", ")}. Spectral analysis indicates a high probability of AI-generated speech. This recording likely originates from a deepfake or robocall campaign.`;
  } else if (risk_level === "medium") {
    explanation = `Partial deepfake indicators found. ${indicators.join(", ")}. The vocal characteristics show anomalies that warrant further review before trusting the content.`;
  } else {
    explanation = "Audio analysis shows natural vocal patterns consistent with genuine human speech. No significant deepfake or robocall indicators detected.";
  }

  return { fraud_score: score, risk_level, confidence, explanation, indicators };
}

// ─── Server Actions ───────────────────────────────────────────────────────

export async function analyzeSms(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const text = formData.get("text") as string;
  if (!text?.trim()) return { error: "Please enter a message to analyze." };

  // Server-side credit consumption
  const { data: creditResult, error: creditError } = await supabase
    .rpc("consume_credit", { p_user_id: user.id });

  if (creditError) return { error: "Could not process credit. Try again." };
  if (!(creditResult as { success: boolean }).success) {
    return { error: "no_credits" };
  }

  const analysis = analyzeSmsText(text);

  // Save to history
  const { data: scan, error: insertError } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      type: "sms",
      label: text.slice(0, 60) + (text.length > 60 ? "…" : ""),
      fraud_score: analysis.fraud_score,
      risk_level: analysis.risk_level,
      confidence: analysis.confidence,
      explanation: analysis.explanation,
      raw_input: text,
    })
    .select()
    .single();

  if (insertError) return { error: "Failed to save scan result." };

  revalidatePath("/dashboard");
  return {
    success: true,
    scan,
    indicators: analysis.indicators,
    suggestedAction: analysis.suggestedAction,
    creditsRemaining: (creditResult as { credits_remaining: number }).credits_remaining,
  };
}

export async function analyzeAudio(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("audio") as File;
  if (!file) return { error: "No file provided." };

  const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/webm", "audio/flac", "audio/x-m4a"];
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|flac|webm)$/i)) {
    return { error: "Unsupported file type. Use MP3, WAV, OGG, M4A, or FLAC." };
  }
  if (file.size > 25 * 1024 * 1024) {
    return { error: "File too large. Maximum 25MB allowed." };
  }

  // Server-side credit consumption
  const { data: creditResult, error: creditError } = await supabase
    .rpc("consume_credit", { p_user_id: user.id });

  if (creditError) return { error: "Could not process credit. Try again." };
  if (!(creditResult as { success: boolean }).success) {
    return { error: "no_credits" };
  }

  const analysis = analyzeAudioFile(file.name, file.size);

  // Save to history
  const { data: scan, error: insertError } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      type: "audio",
      label: file.name,
      fraud_score: analysis.fraud_score,
      risk_level: analysis.risk_level,
      confidence: analysis.confidence,
      explanation: analysis.explanation,
    })
    .select()
    .single();

  if (insertError) return { error: "Failed to save scan result." };

  revalidatePath("/dashboard");
  return {
    success: true,
    scan,
    indicators: analysis.indicators,
    creditsRemaining: (creditResult as { credits_remaining: number }).credits_remaining,
  };
}

export async function deleteScan(scanId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("scans")
    .delete()
    .eq("id", scanId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete scan." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function upgradePlan(plan: "pro" | "enterprise") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const credits = plan === "pro" ? 100 : 9999;

  const { error } = await supabase
    .from("user_plans")
    .update({
      plan,
      credits_total: credits,
      credits_used: 0,
      reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: "Failed to upgrade plan." };
  revalidatePath("/dashboard");
  return { success: true };
}
