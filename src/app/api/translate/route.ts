import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";

// Lightweight, ephemeral quick-translate shown inline at the selection —
// unlike /api/vocabulary/save-word, this never touches the vocabulary
// catalog or the user's review queue, it's just a one-off lookup.
const bodySchema = z.object({
  text: z.string().trim().min(1).max(280),
  context: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Selección inválida" }, { status: 400 });
  }

  try {
    await recordAiUsageOrThrow(user.id, "translate");
  } catch (err) {
    if (err instanceof AiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const ai = getAIProvider();
  const { translation } = await ai.translateText(parsed.data);

  return NextResponse.json({ translation });
}
