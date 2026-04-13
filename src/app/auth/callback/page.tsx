"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    const handleAuth = async () => {
      // Magic link flow
      if (type === "magiclink" && token) {
        // The browser client already has the token in the URL from the redirect.
        // Just need to verify it.
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "magiclink",
        });

        if (error) {
          console.error("Magic link verify failed:", error.message);
          setError("Falha no login. Tente novamente.");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }
      }

      // OAuth flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("OAuth exchange failed:", error.message);
          setError("Falha no login. Tente novamente.");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }
      }

      // Give the browser time to persist the session cookie
      await new Promise((r) => setTimeout(r, 200));

      // Verify we have a session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sessão não encontrada. Tente novamente.");
        setTimeout(() => router.push("/auth/login"), 3000);
        return;
      }

      // Redirect based on onboarding status
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

    if (!code && !token) {
      setError("Parâmetros de autenticação ausentes.");
      setTimeout(() => router.push("/auth/login"), 3000);
      return;
    }

    handleAuth();
  }, [supabase, router, searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecionando para o login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Finalizando login...</p>
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
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
