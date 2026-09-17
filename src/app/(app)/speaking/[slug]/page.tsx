import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { SPEAKING_PROMPTS } from "@/content/speaking-prompts";
import { SpeakingSession } from "@/components/speaking/SpeakingSession";

export default async function SpeakingPromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;
  const level = user.profile?.targetLevel ?? "C1";

  const prompt = SPEAKING_PROMPTS.find((p) => p.slug === slug);
  if (!prompt) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link href="/speaking" className="text-xs text-muted-foreground hover:text-primary">
          ← Volver a Speaking
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{prompt.title}</h1>
      </div>

      <SpeakingSession prompt={prompt} targetLevel={level} />
    </div>
  );
}
