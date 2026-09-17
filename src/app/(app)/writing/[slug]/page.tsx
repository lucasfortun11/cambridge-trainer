import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getWritingPromptBySlug } from "@/lib/writing-prompts";
import { WritingEditor } from "@/components/writing/WritingEditor";

export default async function WritingPromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireOnboardedUser();
  const { slug } = await params;
  const level = user.profile?.targetLevel ?? "C1";

  const prompt = await getWritingPromptBySlug(level, slug);
  if (!prompt) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <Link href="/writing" className="text-xs text-muted-foreground hover:text-primary">
          ← Volver a Writing
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{prompt.title}</h1>
      </div>

      <div className="whitespace-pre-line rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-foreground">
        {prompt.brief}
        {prompt.notes && (
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            {prompt.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </div>

      <WritingEditor prompt={prompt} targetLevel={level} />
    </div>
  );
}
