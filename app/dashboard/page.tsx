import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import type { UserPlan, Scan } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your scans and view threat reports on TruScan AI.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  // Fetch user plan + scans in parallel
  const [planResult, scansResult] = await Promise.all([
    supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("scans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // Auto-provision free plan if missing (edge case)
  let plan: UserPlan = planResult.data as UserPlan;
  if (!plan) {
    const { data: newPlan } = await supabase
      .from("user_plans")
      .insert({ user_id: user.id, plan: "free", credits_total: 10, credits_used: 0 })
      .select()
      .single();
    plan = newPlan as UserPlan;
  }

  const scans: Scan[] = (scansResult.data ?? []) as Scan[];

  return (
    <DashboardClient
      user={user}
      initialPlan={plan}
      initialScans={scans}
    />
  );
}
