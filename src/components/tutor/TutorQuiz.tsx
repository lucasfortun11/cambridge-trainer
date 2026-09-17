"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ListChecks } from "lucide-react";

type QuizQuestion = {
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
};

export function TutorQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  function normalize(s: string) {
    return s.trim().toLowerCase();
  }

  return (
    <div className="ml-9 max-w-[80%] space-y-2 rounded-xl border border-primary/20 bg-surface-muted p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <ListChecks className="h-3.5 w-3.5" />
        Comprueba que lo has entendido
      </p>
      {questions.map((q, i) => {
        const answered = answers[i];
        const isCorrect = answered && normalize(answered) === normalize(q.correctAnswer);
        return (
          <div key={i} className="rounded-lg bg-surface p-2.5">
            <p className="mb-1.5 text-sm text-foreground">{q.prompt}</p>
            {q.options && !answered && (
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: opt }))}
                    className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:border-primary/50"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {answered && (
              <p
                className={`flex items-center gap-1 text-xs ${isCorrect ? "text-success" : "text-danger"}`}
              >
                {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {isCorrect ? "¡Correcto!" : `Respuesta correcta: ${q.correctAnswer}`}
                <span className="ml-1 font-normal text-muted-foreground">{q.explanation}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
