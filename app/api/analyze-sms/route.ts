import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SmsAnalysisResult {
  fraud_score: number;         // 0–100
  risk_level: "Low" | "Medium" | "High";
  summary: string;             // short AI explanation
  suggested_action: string;    // recommended next step
}

// ── Groq client (server-only, GROQ_API_KEY never exposed to browser) ───────

function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");
  return new Groq({ apiKey: key });
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are TruScan AI — an expert SMS fraud and phishing detection engine trusted by security researchers and financial institutions.

Your task is to analyse SMS messages for fraud, scam, and phishing signals. You understand messages written in English, Hindi, Hinglish, and Roman Hindi.

You detect:
- Phishing / smishing attacks
- Fake banking alerts and impersonation of banks (SBI, HDFC, ICICI, Kotak, etc.)
- Suspicious or shortened URLs (bit.ly, tinyurl, etc.)
- OTP theft attempts ("share your OTP")
- Urgency-pressure tactics ("act now", "expires in 24 hours", "turant", "abhi")
- Impersonation of government, police, or well-known companies
- Payment fraud and fake prize/lottery messages
- Social engineering and credential harvesting

Scoring guidelines:
- 0–29  → Low risk (legitimate or no significant signals)
- 30–64 → Medium risk (suspicious; caution warranted)
- 65–100 → High risk (clear fraud / phishing attempt)

IMPORTANT: Respond ONLY with a single valid JSON object, no markdown, no explanation outside the JSON. Use exactly this schema:
{
  "fraud_score": <integer 0-100>,
  "risk_level": "<Low|Medium|High>",
  "summary": "<1-2 sentence explanation of findings>",
  "suggested_action": "<clear recommended action for the user>"
}`;

// ── POST /api/analyze-sms ──────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse body
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // 2. Validate input
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Message is required and cannot be empty." },
      { status: 400 }
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { error: "Message exceeds maximum length of 5000 characters." },
      { status: 400 }
    );
  }

  // 3. Call Groq
  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,         // low temp for stable, deterministic output
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyse this SMS message for fraud:\n\n"""\n${message}\n"""`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // 4. Parse Groq JSON response
    let parsed: SmsAnalysisResult;
    try {
      // Strip any accidental markdown code fences if present
      const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned) as SmsAnalysisResult;
    } catch {
      console.error("[analyze-sms] Failed to parse Groq response:", raw);
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    // 5. Validate & clamp parsed values
    const fraud_score = Math.max(0, Math.min(100, Math.round(Number(parsed.fraud_score) || 0)));
    const risk_level = (["Low", "Medium", "High"] as const).includes(parsed.risk_level as never)
      ? parsed.risk_level
      : fraud_score >= 65 ? "High" : fraud_score >= 30 ? "Medium" : "Low";

    const result: SmsAnalysisResult = {
      fraud_score,
      risk_level,
      summary: String(parsed.summary || "Analysis complete.").slice(0, 500),
      suggested_action: String(parsed.suggested_action || "No action required.").slice(0, 300),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[analyze-sms] Groq API error:", err);
    return NextResponse.json(
      { error: "AI analysis service unavailable. Please try again." },
      { status: 503 }
    );
  }
}
