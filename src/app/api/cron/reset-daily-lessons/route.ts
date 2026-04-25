import { NextResponse } from "next/server";

/**
 * Reserved for future “daily lesson queue” rotation (pillar schedule, BRT midnight).
 * Idempotent no-op until queue tables exist — keeps Vercel cron path stable with CLAUDE.md.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    note: "noop: wire daily lesson invalidation or queue reset when schema is ready",
  });
}
