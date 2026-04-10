import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side auth callback handler.
 * Handles both flows:
 * - Magic link: ?token=xxx&type=magiclink
 * - OAuth:      ?code=xxx
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

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

  try {
    if (type === "magiclink" && token) {
      // Magic link flow: verify the token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });

      if (error) {
        console.error("[auth/callback] Magic link verify error:", error.message);
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
      }

      if (!data.session) {
        console.error("[auth/callback] No session from magic link verify");
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
      }

      console.log("[auth/callback] Magic link session established for", data.user?.email);
      return response;
    }

    if (code) {
      // OAuth flow: exchange PKCE code
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[auth/callback] OAuth exchange error:", error.message);
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
      }

      if (!data.session) {
        console.error("[auth/callback] No session from OAuth exchange");
        return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
      }

      console.log("[auth/callback] OAuth session established for", data.user?.email);
      return response;
    }

    console.log("[auth/callback] No token or code in URL");
    return NextResponse.redirect(`${origin}/auth/login`);
  } catch (err: any) {
    console.error("[auth/callback] Unexpected error:", err.message);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }
}
