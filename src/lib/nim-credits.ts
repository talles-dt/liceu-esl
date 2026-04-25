import { createAdminClient } from "@/lib/supabase/server";

function monthStartUtcIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

export function getNimCreditLimit(): number {
  const n = parseInt(process.env.NVIDIA_CREDIT_LIMIT ?? "1000", 10);
  return Number.isFinite(n) && n > 0 ? n : 1000;
}

/** True when another NIM call is allowed this UTC month (soft cap). */
export async function assertNimCreditsAvailable(): Promise<boolean> {
  const supabase = await createAdminClient();
  const start = monthStartUtcIso();
  const { count, error } = await supabase
    .from("nim_usage")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start);

  if (error) {
    console.error("nim_usage count:", error);
    return true;
  }

  const used = count ?? 0;
  return used < getNimCreditLimit();
}

export async function recordNimUsage(source: string, userId: string | null): Promise<void> {
  try {
    const supabase = await createAdminClient();
    await supabase.from("nim_usage").insert({ source, user_id: userId });
  } catch (e) {
    console.error("recordNimUsage:", e);
  }
}
