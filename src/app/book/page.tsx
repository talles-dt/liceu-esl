"use client";

import { createClient } from "@/lib/supabase/client";
import CalBooking from "@/components/CalBooking";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookClassPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read Cal.com username from env
    const calUser = process.env.NEXT_PUBLIC_CAL_COM_USERNAME ?? null;
    setUsername(calUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!username) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-2xl font-bold">Agendar uma Aula</h1>
          <p className="text-muted-foreground">
            O agendamento não está disponível no momento. Por favor, volte mais tarde.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Agendar uma Aula</h1>
          <p className="text-muted-foreground mt-1">
            Agende uma sessão individual com seu professor. Selecione um horário que funcione para você.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <CalBooking
            username={username}
            eventSlug="30min"
            className="w-full"
          />
        </div>
      </div>
    </main>
  );
}
