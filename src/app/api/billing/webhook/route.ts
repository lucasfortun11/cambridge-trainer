import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// Stripe calls this directly (not the browser) after a checkout or
// subscription change — this is the only source of truth for activating a
// real paid plan; POST /api/billing/checkout only *starts* the payment.
// Configure this URL (https://yourdomain.com/api/billing/webhook) in the
// Stripe Dashboard under Developers > Webhooks, subscribed to at least
// checkout.session.completed and customer.subscription.deleted.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe no está configurado" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[billing/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      const plan = session.metadata?.plan === "ANNUAL" ? "ANNUAL" : "MONTHLY";
      if (userId && typeof session.customer === "string") {
        await prisma.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            planTier: plan,
            subscribedAt: new Date(),
            subscriptionCancelledAt: null,
            stripeCustomerId: session.customer,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : null,
          },
          update: {
            planTier: plan,
            subscribedAt: new Date(),
            subscriptionCancelledAt: null,
            stripeCustomerId: session.customer,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : null,
          },
        });
      }
      break;
    }

    // A subscription reaching its actual end (cancelled and the period ran
    // out, or payment failures exhausted retries). We deliberately don't act
    // on "customer.subscription.updated" with cancel_at_period_end — Stripe
    // still considers that subscription active until the period ends, so
    // access should continue until this event fires.
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.userProfile.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { subscriptionCancelledAt: new Date() },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
