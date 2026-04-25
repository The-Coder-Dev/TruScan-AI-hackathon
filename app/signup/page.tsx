"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signUpWithEmail } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function handleEmailSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const result = await signUpWithEmail(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  async function handleGoogleSignIn() {
    setIsGooglePending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setIsGooglePending(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL (Form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Shield className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              TruScan<span className="text-primary">AI</span>
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Start detecting fraud in seconds — free forever.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-medium gap-2 border-border/60 hover:bg-secondary/60 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isGooglePending || isPending}
          >
            {isGooglePending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Jane Smith"
                className="h-11 bg-secondary/30 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-11 bg-secondary/30 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  className="h-11 bg-secondary/30 border-border/60 focus:border-primary/60 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirm"
                name="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                className="h-11 bg-secondary/30 border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              disabled={isPending || isGooglePending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (Visual) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-primary to-primary/80" />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-fit border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Free forever, no credit card</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Join 40,000+
              <br />
              <span className="text-white/70">teams protected</span>
              <br />
              by TruScan.
            </h2>
            <p className="text-white/70 text-lg max-w-sm leading-relaxed">
              Set up real-time deepfake and scam detection for your entire
              organization in under 5 minutes.
            </p>

            <div className="flex gap-8 pt-2">
              {[
                { value: "Free", label: "Starter plan" },
                { value: "5 min", label: "Setup time" },
                { value: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature list */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 space-y-3">
            {[
              "Real-time deepfake audio detection",
              "SMS & email scam pattern analysis",
              "Instant alerts to your team",
              "SOC 2 Type II certified",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
