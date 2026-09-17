import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, isStripeConfigured, appUrl } from "@/lib/stripe";

// Lets a real (Stripe-paying) subscriber manage or cancel their subscription
// through Stripe's own hosted billing portal, instead of the demo-mode
// POST /api/billing/cancel.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isStripeConfigured() || !user.profile?.stripeCustomerId) {
    return NextResponse.json({ error: "No hay una suscripción de pago real que gestionar" }, { status: 400 });
  }

  const stripe = getStripe()!;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.profile.stripeCustomerId,
      return_url: `${appUrl()}/pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/portal] Stripe error:", err);
    return NextResponse.json({ error: "No se pudo abrir el panel de facturación" }, { status: 500 });
  }
}
