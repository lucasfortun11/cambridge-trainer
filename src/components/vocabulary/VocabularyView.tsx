"use client";

import { useState } from "react";
import { FlashcardReview } from "./FlashcardReview";
import { VocabularyBrowser } from "./VocabularyBrowser";

const TABS = [
  { id: "review", label: "Repasar hoy" },
  { id: "mine", label: "Mi diccionario" },
  { id: "browse", label: "Explorar todas" },
] as const;

export function VocabularyView() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("review");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "review" && <FlashcardReview />}
      {tab === "mine" && <VocabularyBrowser mine />}
      {tab === "browse" && <VocabularyBrowser />}
    </div>
  );
}
