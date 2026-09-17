import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildMockExamDetails } from "@/lib/mock-exam";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const level = user.profile?.targetLevel ?? "C1";

  // C1 assembles from the static bank (no AI call); other levels generate
  // up to 6 fresh exercises, so weight the usage check accordingly.
  if (level !== "C1") {
    try {
      await recordAiUsageOrThrow(user.id, "mock-exam", 6);
    } catch (err) {
      if (err instanceof AiRateLimitError) {
        return NextResponse.json({ error: err.message }, { status: 429 });
      }
      throw err;
    }
  }

  const details = await buildMockExamDetails(level);

  const exam = await prisma.mockExam.create({
    data: {
      userId: user.id,
      details: JSON.stringify(details),
    },
  });

  return NextResponse.json({ id: exam.id });
}
