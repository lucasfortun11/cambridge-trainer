import { Layers } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { VocabularyView } from "@/components/vocabulary/VocabularyView";

export default async function VocabularyPage() {
  await requireOnboardedUser();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Layers className="h-5 w-5 text-primary" />
          Vocabulary
        </h1>
        <p className="text-sm text-muted-foreground">
          Flashcards con repetición espaciada — el sistema decide cuándo repasar cada palabra.
        </p>
      </div>
      <VocabularyView />
    </div>
  );
}
