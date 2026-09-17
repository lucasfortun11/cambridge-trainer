import type { AIProvider } from "./provider";
import { MockAIProvider } from "./mockProvider";
import { DeepSeekAIProvider } from "./deepseekProvider";

let cached: AIProvider | null = null;

// Adding another real backend later: implement AIProvider in a new file
// (see deepseekProvider.ts for an example) and add a case below. Nothing
// that calls getAIProvider() needs to change.
export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const kind = process.env.AI_PROVIDER ?? "mock";

  switch (kind) {
    case "deepseek":
      cached = new DeepSeekAIProvider();
      break;
    case "mock":
    default:
      cached = new MockAIProvider();
      break;
  }

  return cached;
}

export type * from "./types";
export type { AIProvider } from "./provider";
