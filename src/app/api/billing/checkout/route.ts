import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, isStripeConfigured, stripePriceId, appUrl } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["MONTHLY", "ANNUAL"]),
});

// Entry point for "Elegir plan" on /pricing. If Stripe is configured, starts
// a real hosted Stripe Checkout session (card details are entered on
// Stripe's own page — they never touch our server) and the client redirects
// there. Otherwise responds { mock: true } and the client falls back to the
// existing simulated checkout panel (POST /api/billing/subscribe).
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ mock: true });
  }

  const stripe = getStripe()!;
  const { plan } = parsed.data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId(plan), quantity: 1 }],
      client_reference_id: user.id,
      customer: user.profile?.stripeCustomerId ?? undefined,
      customer_email: user.profile?.stripeCustomerId ? undefined : user.email,
      metadata: { userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      success_url: `${appUrl()}/pricing?success=1`,
      cancel_url: `${appUrl()}/pricing`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout] Stripe error:", err);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}
