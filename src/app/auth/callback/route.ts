import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side auth callback handler.
 * Supabase redirects here with ?code= after magic link / OAuth.
 * This exchanges the code for a session server-side, sets cookies properly,
 * then redirects to the app.
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    console.log("[auth/callback] No code in URL");
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange error:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed&detail=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    console.error("[auth/callback] No session returned from exchange");
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  console.log("[auth/callback] Session established for", data.user?.email, "id:", data.user?.id);

  // Build response and set cookies from the session
  const response = NextResponse.redirect(`${origin}/onboarding`);

  const { access_token, refresh_token } = data.session;

  // Standard Supabase cookie names that @supabase/ssr reads
  response.cookies.set(
    "sb-access-token",
    access_token,
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
    }
  );

  response.cookies.set(
    "sb-refresh-token",
    refresh_token,
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    }
  );

  return response;
}
