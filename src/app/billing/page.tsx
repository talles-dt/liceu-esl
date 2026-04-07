import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const isPaid =
    subscription?.status === "active" || subscription?.status === "trialing";

  // Create billing portal session (Stripe Customer Portal)
  async function createBillingSession() {
    "use server";

    if (!subscription?.stripe_customer_id) {
      redirect("/billing");
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    redirect(session.url);
  }

  async function createCheckoutSession() {
    "use server";

    if (!user?.email) return;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
      },
    });

    if (session.url) {
      redirect(session.url);
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Faturamento e Assinatura</h1>

        {isPaid ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Plano Pro Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="text-success capitalize">
                    {subscription.status}
                  </span>
                </p>
              </div>
            </div>

            {subscription.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Próxima data de cobrança:{" "}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  "pt-BR"
                )}
              </p>
            )}

            <form action={createBillingSession}>
              <button className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition">
                Gerenciar Assinatura
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Gerencie formas de pagamento, atualize dados de cobrança ou cancele a assinatura via Stripe.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-primary/30 rounded-xl p-6 space-y-4">
            <div className="text-center space-y-2">
              <span className="text-3xl">🚀</span>
              <h2 className="text-xl font-bold">Atualize para o Pro</h2>
              <p className="text-muted-foreground">
                Desbloqueie a plataforma completa — exercícios ilimitados, tutor de IA, sequências e tabelas de classificação.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">R$99</p>
              <p className="text-muted-foreground text-sm">/mês</p>
            </div>

            <form action={createCheckoutSession}>
              <button className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition neon-glow">
                Comece a Aprender Hoje
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Cancele a qualquer momento. Gerenciado com segurança via Stripe.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
