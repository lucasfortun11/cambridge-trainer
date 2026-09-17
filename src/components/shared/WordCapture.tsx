"use client";

import { useEffect, useRef, useState } from "react";
import { BookPlus, Check, Languages, Loader2 } from "lucide-react";
import { isValidWordSelection } from "@/lib/wordSelection";

type Placement = "above" | "below";
type Popover = { key: number; text: string; x: number; y: number; context: string; placement: Placement };
type AddState = "idle" | "saving" | "saved" | "error";
type TranslateState = "idle" | "loading" | "done" | "error";

const POPOVER_HALF_WIDTH = 140; // rough estimate, just for edge clamping
const VIEWPORT_MARGIN = 10;

/**
 * Mounted once for the whole authenticated app (see AppShell). Lets the
 * user select any short piece of text on any page — a Reading passage, a
 * Listening transcript, a Grammar explanation, a tutor reply, anything
 * rendered as normal page text — and either:
 * - see a quick inline translation right there, without leaving the page, or
 * - add it to their personal vocabulary dictionary ("Mi diccionario" in
 *   /vocabulary), which for a multi-word phrase also gets a grammar/tense
 *   breakdown, not just a definition.
 */
export function WordCapture() {
  const [popover, setPopover] = useState<Popover | null>(null);
  const [addState, setAddState] = useState<AddState>("idle");
  const [translateState, setTranslateState] = useState<TranslateState>("idle");
  const [translation, setTranslation] = useState<string | null>(null);
  const nextKeyRef = useRef(0);

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      // A click on the popover's own buttons also bubbles a mouseup to the
      // document — without this guard it would be treated as a brand new
      // selection (the highlighted text is often still active) and rebuild
      // the popover from scratch mid-click, wiping out its loading/done
      // state before "Traducir"/"Añadir" could ever show a result.
      if ((e.target as HTMLElement)?.closest?.("[data-word-capture-popover]")) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";

      if (!isValidWordSelection(text)) {
        setPopover(null);
        return;
      }
      if (!selection || selection.rangeCount === 0) return;

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const context = selection.anchorNode?.parentElement?.textContent?.trim().slice(0, 500) ?? "";

      // Flip below the selection when there isn't enough room above (e.g.
      // the very top line of a passage), and keep the popover fully inside
      // the viewport horizontally instead of running off the edge.
      const placement: Placement = rect.top < 60 ? "below" : "above";
      const x = Math.min(
        Math.max(rect.left + rect.width / 2, POPOVER_HALF_WIDTH + VIEWPORT_MARGIN),
        window.innerWidth - POPOVER_HALF_WIDTH - VIEWPORT_MARGIN
      );
      const y = placement === "above" ? rect.top : rect.bottom;

      setAddState("idle");
      setTranslateState("idle");
      setTranslation(null);
      nextKeyRef.current += 1;
      setPopover({ key: nextKeyRef.current, text, x, y, context, placement });
    }

    function handlePointerDown(e: MouseEvent) {
      // Let the popover's own click handlers fire first; only dismiss for
      // clicks elsewhere on the page.
      if ((e.target as HTMLElement)?.closest?.("[data-word-capture-popover]")) return;
      setPopover(null);
    }

    function handleScroll() {
      // A fixed-position popover would otherwise drift away from the text
      // it's pointing at as soon as the page scrolls.
      setPopover(null);
    }

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  async function addWord() {
    if (!popover) return;
    setAddState("saving");
    try {
      const res = await fetch("/api/vocabulary/save-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: popover.text, context: popover.context }),
      });
      setAddState(res.ok ? "saved" : "error");
    } catch {
      setAddState("error");
    }
  }

  async function translate() {
    if (!popover) return;
    setTranslateState("loading");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: popover.text, context: popover.context }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslation(data.translation);
        setTranslateState("done");
      } else {
        setTranslateState("error");
      }
    } catch {
      setTranslateState("error");
    }
  }

  if (!popover) return null;

  // The popover's resting transform is the keyframe's own "to" state (see
  // .animate-word-capture-in in globals.css); a fresh `key` per selection
  // remounts the element so the enter animation replays every time.
  const restingY = popover.placement === "above" ? "calc(-100% - 8px)" : "8px";
  const startY = popover.placement === "above" ? "calc(-100% - 2px)" : "2px";

  return (
    <div
      key={popover.key}
      data-word-capture-popover
      style={
        {
          left: popover.x,
          top: popover.y,
          "--word-capture-from-y": startY,
          "--word-capture-to-y": restingY,
        } as React.CSSProperties
      }
      className="animate-word-capture-in fixed z-[100] max-w-[300px] rounded-lg bg-foreground px-2 py-2 text-background shadow-lg"
    >
      <div className="flex items-center gap-1.5">
        <button
          onClick={translate}
          disabled={translateState === "loading"}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background/10 disabled:opacity-70"
        >
          {translateState === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          Traducir
        </button>

        <span className="h-4 w-px shrink-0 bg-background/30" />

        <button
          onClick={addWord}
          disabled={addState === "saving" || addState === "saved"}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background/10 disabled:opacity-90"
        >
          {addState === "saving" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : addState === "saved" ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <BookPlus className="h-3.5 w-3.5" />
          )}
          {addState === "saving"
            ? "Añadiendo..."
            : addState === "saved"
              ? "Añadida"
              : addState === "error"
                ? "Error — reintentar"
                : "Añadir al diccionario"}
        </button>
      </div>

      {translateState === "done" && translation && (
        <p className="mt-1.5 border-t border-background/20 px-2 pt-1.5 text-xs">
          <span className="opacity-70">{popover.text} → </span>
          <span className="font-medium">{translation}</span>
        </p>
      )}
      {translateState === "error" && (
        <p className="mt-1.5 border-t border-background/20 px-2 pt-1.5 text-xs text-danger">
          No se pudo traducir. Inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
