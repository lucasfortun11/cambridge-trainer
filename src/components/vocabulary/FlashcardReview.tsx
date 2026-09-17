"use client";

import { useEffect, useState } from "react";
import { Loader2, Volume2, PartyPopper } from "lucide-react";

type Word = {
  id: string;
  word: string;
  definition: string;
  translation: string | null;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  phrasalVerbs: string[];
  pronunciationIPA: string | null;
  category: string | null;
  cefrLevel: string;
  grammarNote: string | null;
};

type Card = { reviewId: string; word: Word; status: string };

const QUALITY_BUTTONS = [
  { label: "Otra vez", quality: 0, className: "border-danger text-danger hover:bg-danger-bg" },
  { label: "Difícil", quality: 3, className: "border-warning text-warning hover:bg-warning-bg" },
  { label: "Bien", quality: 4, className: "border-primary text-primary hover:bg-primary/10" },
  { label: "Fácil", quality: 5, className: "border-success text-success hover:bg-success-bg" },
];

export function FlashcardReview() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    fetch("/api/vocabulary/due")
      .then((r) => r.json())
      .then((data) => setCards(data.cards));
  }, []);

  function speak(word: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function rate(quality: number) {
    if (!cards) return;
    const card = cards[index];
    setSubmitting(true);
    try {
      await fetch(`/api/vocabulary/${card.word.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality }),
      });
      setReviewedCount((c) => c + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (cards === null) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (cards.length === 0 || index >= cards.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <PartyPopper className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-foreground">
          {reviewedCount > 0
            ? `¡Has repasado ${reviewedCount} palabras! Vuelve más tarde para más.`
            : "No tienes palabras pendientes de repaso por ahora."}
        </p>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-2 text-center text-xs text-muted-foreground">
        {index + 1} / {cards.length}
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="min-h-[280px] cursor-pointer rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        {!flipped ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-2xl font-semibold text-foreground">{card.word.word}</p>
            {card.word.pronunciationIPA && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speak(card.word.word);
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <Volume2 className="h-4 w-4" />
                {card.word.pronunciationIPA}
              </button>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Toca la tarjeta para ver la respuesta</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold text-foreground">{card.word.word}</p>
            <p className="text-foreground">{card.word.definition}</p>
            {card.word.translation && (
              <p className="text-muted-foreground">Traducción: {card.word.translation}</p>
            )}
            <p className="italic text-muted-foreground">&ldquo;{card.word.exampleSentence}&rdquo;</p>
            {card.word.grammarNote && (
              <p className="rounded-lg bg-primary/5 p-2 text-xs text-foreground">
                <span className="font-medium text-primary">Estructura/tiempo verbal: </span>
                {card.word.grammarNote}
              </p>
            )}
            {card.word.collocations.length > 0 && (
              <p>
                <span className="font-medium text-foreground">Collocations: </span>
                <span className="text-muted-foreground">{card.word.collocations.join(", ")}</span>
              </p>
            )}
            {card.word.synonyms.length > 0 && (
              <p>
                <span className="font-medium text-foreground">Sinónimos: </span>
                <span className="text-muted-foreground">{card.word.synonyms.join(", ")}</span>
              </p>
            )}
            {card.word.phrasalVerbs.length > 0 && (
              <p>
                <span className="font-medium text-foreground">Phrasal verbs: </span>
                <span className="text-muted-foreground">{card.word.phrasalVerbs.join(", ")}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {flipped ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {QUALITY_BUTTONS.map((b) => (
            <button
              key={b.label}
              disabled={submitting}
              onClick={() => rate(b.quality)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${b.className}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Mostrar respuesta
        </button>
      )}
    </div>
  );
}
