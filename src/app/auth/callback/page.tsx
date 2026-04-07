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

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("PKCE exchange failed:", exchangeError);
          setError("Failed to complete sign in.");
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }
      }

      // Small delay to ensure cookie is set, then get user
      await new Promise((r) => setTimeout(r, 100));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No session found.");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      // Check onboarding status
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_complete, cefr_level")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_complete && profile?.cefr_level) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
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
