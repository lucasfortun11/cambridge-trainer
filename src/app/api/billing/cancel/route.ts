import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";

// Demo-billing-only cancel. Once Stripe is configured, cancellation goes
// through the real billing portal instead — see POST /api/billing/portal.
export async function POST() {
  if (isStripeConfigured()) {
    return NextResponse.json({ error: "Usa el panel de facturación real (Stripe) en su lugar" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.userProfile.updateMany({
    where: { userId: user.id },
    data: { subscriptionCancelledAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
