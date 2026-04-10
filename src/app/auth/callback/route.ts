import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side auth callback handler.
 * Supabase redirects here with ?code= after magic link / OAuth.
 * The @supabase/ssr client reads the code_verifier from cookies
 * (set by the client-side signInWithOtp call) and exchanges it properly.
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    console.log("[auth/callback] No code in URL");
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  let response = NextResponse.redirect(`${origin}/onboarding`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
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
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  if (!data.session) {
    console.error("[auth/callback] No session returned from exchange");
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  console.log("[auth/callback] Session established for", data.user?.email);

  return response;
}
