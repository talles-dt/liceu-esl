"use client";

import CalBooking from "@/components/CalBooking";

export default function BookClassPage() {
  const username = process.env.NEXT_PUBLIC_CAL_COM_USERNAME ?? null;

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
          <CalBooking username={username} eventSlug="30min" className="w-full" />
        </div>
      </div>
    </main>
  );
}
