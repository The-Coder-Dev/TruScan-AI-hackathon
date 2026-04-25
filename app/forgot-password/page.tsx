"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Shield, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPassword } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      {/* Background radial glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-60" />
      </div>

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
            Forgot password?
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and we&apos;ll send you a reset link.
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
          <Alert className="border-emerald-500/40 bg-emerald-500/10 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending reset link…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        {/* Back to sign in */}
        <Link
          href="/signin"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
