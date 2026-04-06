import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/types/database";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as unknown as {
        customer: string;
        subscription: string;
        metadata?: { user_id: string };
      };

      if (!session.subscription || !session.metadata?.user_id) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const sub = subscription as unknown as {
        id: string;
        status: string;
        current_period_end: number | null;
      };

      await supabase.from("subscriptions").upsert({
        user_id: session.metadata.user_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: sub.id,
        status: sub.status as SubscriptionStatus,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      });

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as unknown as {
        subscription: string;
        period_end: number;
      };

      if (!invoice.subscription) break;

      await supabase
        .from("subscriptions")
        .update({
          status: "active" as SubscriptionStatus,
          current_period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", invoice.subscription);

      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as {
        id: string;
        status: string;
        current_period_end: number;
      };

      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status as SubscriptionStatus,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
