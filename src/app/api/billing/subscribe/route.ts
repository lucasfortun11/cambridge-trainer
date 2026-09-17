import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["MONTHLY", "ANNUAL"]),
});

// Demo-billing-only: activates the plan directly with no real charge. Used
// by the simulated checkout panel on /pricing when Stripe isn't configured
// (see POST /api/billing/checkout, which decides which mode to use). Once
// Stripe IS configured, this route refuses to run — real activation only
// ever happens from the Stripe webhook (POST /api/billing/webhook), never
// from a request the browser can call directly.
export async function POST(req: NextRequest) {
  if (isStripeConfigured()) {
    return NextResponse.json({ error: "Usa el pago real (Stripe) en su lugar" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      planTier: parsed.data.plan,
      subscribedAt: new Date(),
      subscriptionCancelledAt: null,
    },
    update: {
      planTier: parsed.data.plan,
      subscribedAt: new Date(),
      subscriptionCancelledAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
