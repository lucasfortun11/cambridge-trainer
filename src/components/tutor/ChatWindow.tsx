"use client";

import { useRef, useState, type FormEvent } from "react";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { TutorQuiz } from "./TutorQuiz";

type Message = { id: string; role: "USER" | "TUTOR"; content: string };
type SuggestedQuestion = {
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
};

type ChatWindowProps = {
  initialMessages: Message[];
};

export function ChatWindow({ initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [quizzes, setQuizzes] = useState<Record<string, SuggestedQuestion[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: "USER", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        if (data.suggestedExercises?.length > 0) {
          setQuizzes((prev) => ({ ...prev, [data.message.id]: data.suggestedExercises }));
        }
      }
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-border bg-surface">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Pregúntale a tu profesor de inglés cualquier duda de gramática, vocabulario o
            sobre tu examen de Cambridge English. Prueba, por ejemplo: &ldquo;explain inversion&rdquo;.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <div className={`flex items-start gap-2 ${m.role === "USER" ? "flex-row-reverse" : ""}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                {m.role === "USER" ? (
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${
                  m.role === "USER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
            {quizzes[m.id] && <TutorQuiz questions={quizzes[m.id]} />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Escribiendo...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta en inglés o español..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
