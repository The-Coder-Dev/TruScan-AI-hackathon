import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AudioAnalysisResult {
  transcript: string;
  deepfake_score: number;    // 0–100 from Reality Defender
  fraud_score: number;       // 0–100 from Llama
  risk_level: "Low" | "Medium" | "High";
  summary: string;
  suggested_action: string;
}

interface LlamaFraudResult {
  fraud_score: number;
  risk_level: "Low" | "Medium" | "High";
  summary: string;
  suggested_action: string;
}

interface RdPresignedResponse {
  uploadUrl: string;
  request_id: string;
}

interface RdResultResponse {
  status?: string;
  models_result?: { ensemble?: { score?: number } };
  score?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RD_BASE = "https://api.prd.realitydefender.xyz";
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB (RD limit)
const POLL_ATTEMPTS = 12;
const POLL_INTERVAL = 3000;

const ALLOWED_MIME = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
  "audio/ogg", "audio/m4a", "audio/x-m4a", "audio/mp4",
  "audio/webm", "audio/flac", "audio/aac", "video/mp4",
]);
const ALLOWED_EXT = /\.(mp3|wav|m4a|mp4|ogg|flac|webm|aac)$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groqClient(): Groq {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error("GROQ_API_KEY not configured");
  return new Groq({ apiKey: key });
}

function rdKey(): string {
  const key = process.env.REALITY_DEFENDER_API_KEY?.trim();
  if (!key) throw new Error("REALITY_DEFENDER_API_KEY not configured");
  return key;
}

// ─── Step 1: Whisper Transcription ───────────────────────────────────────────

async function transcribeAudio(file: File): Promise<string> {
  const groq = groqClient();
  const result = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    response_format: "text",
    temperature: 0,
    // No explicit language → Whisper auto-detects Hindi/English/Hinglish
  });
  const text = typeof result === "string" ? result : (result as { text?: string }).text ?? "";
  return text.trim();
}

// ─── Step 2: Llama Fraud Intent Detection ────────────────────────────────────

const FRAUD_PROMPT = `You are TruScan AI — an expert audio call fraud detection engine trusted by security researchers and financial institutions in India.

Analyze call transcripts for fraud signals. You understand English, Hindi, Hinglish, and Roman Hindi mixed-language scam call patterns.

DETECT:
- Fake banking scams (SBI, HDFC, ICICI, Kotak, Axis, RBI, SEBI impersonation)
- KYC fraud ("aapka KYC pending hai", "account band ho jayega")
- OTP theft ("OTP share karo", "verify karne ke liye batao")
- UPI fraud ("UPI pin enter karo", "amount transfer karo")
- Urgency pressure ("abhi karo", "2 ghante mein", "account suspend hoga")
- Government/police impersonation (CBI, income tax, custom officer)
- Fake prizes ("aapne jeet liya", "reward claim karo")
- Suspicious payment requests (gift cards, wallet transfers)
- Social engineering ("aapki beti ka accident hua hai")

SCORING:
- 0–29  → Low   (legitimate, no fraud signals)
- 30–64 → Medium (suspicious, caution warranted)
- 65–100 → High  (clear fraud/scam attempt)

Respond ONLY with valid JSON, no markdown:
{
  "fraud_score": <integer 0-100>,
  "risk_level": "<Low|Medium|High>",
  "summary": "<1-2 sentence explanation>",
  "suggested_action": "<clear recommended action>"
}`;

async function analyzeFraudIntent(transcript: string): Promise<LlamaFraudResult> {
  if (!transcript.trim()) {
    return {
      fraud_score: 10,
      risk_level: "Low",
      summary: "No speech detected. Cannot perform transcript-based fraud analysis.",
      suggested_action: "Ensure the audio file contains voice content and retry.",
    };
  }

  const groq = groqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    max_tokens: 512,
    messages: [
      { role: "system", content: FRAUD_PROMPT },
      {
        role: "user",
        content: `Analyze this call transcript for fraud:\n\n"""\n${transcript}\n"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned) as LlamaFraudResult;

  const fraud_score = Math.max(0, Math.min(100, Math.round(Number(parsed.fraud_score) || 0)));
  const levels = ["Low", "Medium", "High"] as const;
  const risk_level = levels.includes(parsed.risk_level as (typeof levels)[number])
    ? (parsed.risk_level as (typeof levels)[number])
    : fraud_score >= 65 ? "High" : fraud_score >= 30 ? "Medium" : "Low";

  return {
    fraud_score,
    risk_level,
    summary: String(parsed.summary || "Analysis complete.").slice(0, 600),
    suggested_action: String(parsed.suggested_action || "Exercise caution.").slice(0, 300),
  };
}

// ─── Step 3: Reality Defender Deepfake Detection ─────────────────────────────

async function detectDeepfake(file: File): Promise<number> {
  const apiKey = rdKey();

  // Step A: Request signed upload URL
  const presignRes = await fetch(`${RD_BASE}/api/files/aws-presigned`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name }),
  });

  if (!presignRes.ok) {
    throw new Error(`RD presigned URL failed: ${presignRes.status}`);
  }

  const { uploadUrl, request_id } = (await presignRes.json()) as RdPresignedResponse;
  if (!uploadUrl || !request_id) throw new Error("RD returned incomplete presigned response");

  // Step B: Upload audio file via signed URL
  const fileBuffer = await file.arrayBuffer();
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: fileBuffer,
    headers: { "Content-Type": file.type || "audio/mpeg" },
  });
  if (!uploadRes.ok) throw new Error(`RD S3 upload failed: ${uploadRes.status}`);

  // Step C-E: Poll for result
  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    try {
      const res = await fetch(`${RD_BASE}/api/media/users/${request_id}`, {
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      });

      if (!res.ok) continue;
      const data = (await res.json()) as RdResultResponse;
      const status = (data?.status ?? "").toUpperCase();

      if (["PROCESSING", "PENDING", "QUEUED", "UPLOADING"].includes(status)) continue;

      // Extract ensemble score (0.0–1.0) → scale to 0–100
      const raw = data?.models_result?.ensemble?.score ?? data?.score ?? null;
      if (raw !== null && raw !== undefined) {
        const scaled = raw <= 1.0 ? Math.round(raw * 100) : Math.round(Number(raw));
        return Math.max(0, Math.min(100, scaled));
      }

      if (["COMPLETE", "COMPLETED", "DONE", "FINISHED"].includes(status)) {
        return 50; // analysis done but no numeric score returned
      }
    } catch {
      // network blip — keep polling
    }
  }

  // Poll timeout — return neutral score (non-fatal)
  console.warn("[analyze-audio] Reality Defender poll timed out, using neutral score");
  return 50;
}

// ─── Merge final risk ─────────────────────────────────────────────────────────

function mergeRisk(fraud: number, deepfake: number): "Low" | "Medium" | "High" {
  const combined = Math.round(fraud * 0.6 + deepfake * 0.4);
  return combined >= 65 ? "High" : combined >= 30 ? "Medium" : "Low";
}

// ─── POST /api/analyze-audio ─────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const file = formData.get("audio") as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
  }

  // 3. Validate format + size
  if (!ALLOWED_MIME.has(file.type) && !ALLOWED_EXT.test(file.name)) {
    return NextResponse.json(
      { error: "Unsupported format. Upload MP3, WAV, M4A, MP4, OGG, or FLAC." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum is 20 MB." }, { status: 400 });
  }

  // 4. Consume credit (before AI to prevent double-spend)
  const { data: creditResult, error: creditError } = await supabase
    .rpc("consume_credit", { p_user_id: user.id });

  if (creditError) return NextResponse.json({ error: "Credit processing failed." }, { status: 500 });
  if (!(creditResult as { success: boolean }).success) {
    return NextResponse.json({ error: "no_credits" }, { status: 402 });
  }

  const creditsRemaining = (creditResult as { credits_remaining: number }).credits_remaining;

  // Helper: refund credit if pipeline fails critically
  async function refundCredit() {
    await supabase
      .from("user_plans")
      .update({ credits_used: Math.max(0, creditsRemaining) })
      .eq("user_id", user!.id);
  }

  // 5. Step 1 — Whisper transcription
  let transcript: string;
  try {
    transcript = await transcribeAudio(file);
  } catch (err) {
    console.error("[analyze-audio] Whisper error:", err);
    await refundCredit();
    return NextResponse.json(
      { error: "Transcription failed. Ensure audio is clear and try again." },
      { status: 502 }
    );
  }

  // 6. Steps 2 & 3 — Llama + Reality Defender run in parallel
  let fraudResult: LlamaFraudResult;
  let deepfake_score: number;

  try {
    [fraudResult, deepfake_score] = await Promise.all([
      analyzeFraudIntent(transcript),
      // Reality Defender is non-fatal: errors fall back to neutral 50
      detectDeepfake(file).catch((err) => {
        console.error("[analyze-audio] Reality Defender error (non-fatal):", err);
        return 50;
      }),
    ]);
  } catch (err) {
    console.error("[analyze-audio] Llama fraud analysis error:", err);
    await refundCredit();
    return NextResponse.json({ error: "AI fraud analysis failed. Please try again." }, { status: 502 });
  }

  // 7. Merge final risk level
  const risk_level = mergeRisk(fraudResult.fraud_score, deepfake_score);
  const confidence = Math.min(99, Math.max(50,
    Math.round((fraudResult.fraud_score * 0.6 + deepfake_score * 0.4) * 0.35 + 60)
  ));

  // 8. Save to Supabase
  const { data: scan, error: insertError } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      type: "audio",
      label: file.name,
      fraud_score: fraudResult.fraud_score,
      deepfake_score,
      risk_level: risk_level.toLowerCase(),
      confidence,
      explanation: fraudResult.summary,
      raw_input: transcript.slice(0, 2000),
    })
    .select()
    .single();

  if (insertError) {
    console.error("[analyze-audio] DB insert error:", insertError);
    // Non-fatal — return result even if save fails
  }

  // 9. Return full merged result
  return NextResponse.json({
    success: true,
    scan: scan ?? null,
    transcript,
    deepfake_score,
    fraud_score: fraudResult.fraud_score,
    risk_level,
    summary: fraudResult.summary,
    suggested_action: fraudResult.suggested_action,
    indicators: [],
    creditsRemaining,
  });
}
