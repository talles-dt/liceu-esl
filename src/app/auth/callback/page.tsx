"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("No code found in URL.");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      // Exchange PKCE code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Exchange error:", exchangeError.message, exchangeError);
        setError(exchangeError.message);
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      // Verify session exists
      if (!data.session) {
        console.error("No session returned from exchangeCodeForSession");
        setError("No session established.");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      console.log("Auth callback: session established for", data.user?.email);

      // Navigate to dashboard — it will check onboarding status
      // Use window.location to force a full page reload so middleware re-checks the session
      window.location.href = "/dashboard";
    };

    handleCallback();
  }, [supabase, router, searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
