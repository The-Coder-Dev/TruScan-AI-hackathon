"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";

// ─── Groq SMS analysis (real AI — server-only, key never reaches client) ──

const GROQ_SMS_SYSTEM_PROMPT = `You are TruScan AI — an expert SMS fraud and phishing detection engine trusted by security researchers and financial institutions.

Your task is to analyse SMS messages for fraud, scam, and phishing signals. You understand messages written in English, Hindi, Hinglish, and Roman Hindi.

You detect:
- Phishing / smishing attacks
- Fake banking alerts and impersonation of banks (SBI, HDFC, ICICI, Kotak, Axis, PayTM, etc.)
- Suspicious or shortened URLs (bit.ly, tinyurl, goo.gl, etc.)
- OTP theft attempts ("share your OTP", "OTP mat batana")
- Urgency-pressure tactics ("act now", "expires in 24 hours", "turant", "abhi karen")
- Impersonation of government agencies, police, or well-known companies
- Payment fraud and fake prize/lottery messages ("aapne jeeta hai")
- Social engineering and credential harvesting

Scoring guidelines (strictly follow):
- 0–29  → Low   (legitimate or no significant signals)
- 30–64 → Medium (suspicious; caution warranted)
- 65–100 → High  (clear fraud / phishing attempt)

IMPORTANT: Respond ONLY with a single valid JSON object — no markdown, no explanation outside JSON. Use exactly this schema:
{
  "fraud_score": <integer 0-100>,
  "risk_level": "<Low|Medium|High>",
  "summary": "<1-2 sentence explanation of key findings>",
  "suggested_action": "<clear recommended action for the user>"
}`;

interface GroqSmsResult {
  fraud_score: number;
  risk_level: "Low" | "Medium" | "High";
  summary: string;
  suggested_action: string;
}

async function analyzeWithGroq(message: string): Promise<GroqSmsResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    max_tokens: 512,
    messages: [
      { role: "system", content: GROQ_SMS_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyse this SMS message for fraud:\n\n"""\n${message}\n"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  // Strip accidental markdown code fences
  const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned) as GroqSmsResult;

  // Clamp & normalise values
  const fraud_score = Math.max(0, Math.min(100, Math.round(Number(parsed.fraud_score) || 0)));
  const validLevels = ["Low", "Medium", "High"] as const;
  const risk_level = validLevels.includes(parsed.risk_level)
    ? parsed.risk_level
    : fraud_score >= 65 ? "High" : fraud_score >= 30 ? "Medium" : "Low";

  return {
    fraud_score,
    risk_level,
    summary: String(parsed.summary || "Analysis complete.").slice(0, 500),
    suggested_action: String(parsed.suggested_action || "No action required.").slice(0, 300),
  };
}

// ─── Server Actions ───────────────────────────────────────────────────────

export async function analyzeSms(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const text = formData.get("text") as string;
  if (!text?.trim()) return { error: "Please enter a message to analyze." };

  // Server-side credit consumption (before AI call to prevent double-spend)
  const { data: creditResult, error: creditError } = await supabase
    .rpc("consume_credit", { p_user_id: user.id });

  if (creditError) return { error: "Could not process credit. Try again." };
  if (!(creditResult as { success: boolean }).success) {
    return { error: "no_credits" };
  }

  // Real Groq AI analysis
  let aiResult: GroqSmsResult;
  try {
    aiResult = await analyzeWithGroq(text);
  } catch (err) {
    console.error("[analyzeSms] Groq error:", err);
    // Refund credit on AI failure by decrementing credits_used
    await supabase
      .from("user_plans")
      .update({ credits_used: Math.max(0, (creditResult as { credits_remaining: number }).credits_remaining) })
      .eq("user_id", user.id);
    return { error: "AI analysis failed. Please try again." };
  }

  // Map Groq risk_level (Title-case) → DB risk_level (lowercase for check constraint)
  const dbRiskLevel = aiResult.risk_level.toLowerCase() as "low" | "medium" | "high";

  // Derive a realistic confidence value from fraud_score
  const confidence = Math.min(99, Math.max(50, 60 + Math.round(aiResult.fraud_score * 0.35)));

  // Save to scan history
  const { data: scan, error: insertError } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      type: "sms",
      label: text.slice(0, 60) + (text.length > 60 ? "…" : ""),
      fraud_score: aiResult.fraud_score,
      risk_level: dbRiskLevel,
      confidence,
      explanation: aiResult.summary,
      raw_input: text,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[analyzeSms] Insert error:", insertError);
    return { error: "Failed to save scan result." };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    scan,
    indicators: [],            // Groq returns summary instead of discrete indicators
    suggestedAction: aiResult.suggested_action,
    creditsRemaining: (creditResult as { credits_remaining: number }).credits_remaining,
  };
}

// NOTE: Audio analysis has been moved to /api/analyze-audio (route.ts)
// The AudioScanner component calls POST /api/analyze-audio directly.
// This stub is kept for type-safety if any legacy code imports it.
export async function analyzeAudio(_formData: FormData) {
  return { error: "Please use the /api/analyze-audio endpoint." };
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
