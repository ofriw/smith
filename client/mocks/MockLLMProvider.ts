import type {
  CompletionRequest,
  CompletionChunk,
  LLMProvider,
} from "../../common/types/llm.ts";
import type { ScenarioStep, MockTimingConfig } from "./types.ts";
import { DEFAULT_TIMING } from "./types.ts";
import { sleep } from "@goatdb/goatdb";

// Utility to create a delay that can be cancelled
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

// Stream text character by character with delays
async function* streamText(
  text: string,
  charDelayMs: number,
  signal?: AbortSignal
): AsyncIterable<CompletionChunk> {
  for (const char of text) {
    if (signal?.aborted) break;
    yield { type: "text", content: char };
    if (charDelayMs > 0) {
      try {
        await delay(charDelayMs, signal);
      } catch {
        break; // Aborted
      }
    }
  }
}

export type MockLLMProviderOptions = {
  steps: ScenarioStep[];
  timing?: Partial<MockTimingConfig>;
  signal?: AbortSignal;
};

/**
 * MockLLMProvider streams pre-defined scenario content as CompletionChunks.
 * It simulates realistic LLM streaming with configurable delays.
 */
export class MockLLMProvider implements LLMProvider {
  private steps: ScenarioStep[];
  private timing: MockTimingConfig;
  private currentStepIndex = 0;
  private signal?: AbortSignal;
  private isPaused = false;
  private pauseResolve: (() => void) | null = null;

  constructor(options: MockLLMProviderOptions) {
    this.steps = options.steps;
    this.timing = { ...DEFAULT_TIMING, ...options.timing };
    this.signal = options.signal;
  }

  setCurrentStep(index: number): void {
    this.currentStepIndex = index;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.pauseResolve?.();
    this.pauseResolve = null;
  }

  private async waitWhilePaused(): Promise<void> {
    if (!this.isPaused) return; // Quick exit if not paused
    while (this.isPaused && !this.signal?.aborted) {
      await new Promise<void>((resolve) => {
        this.pauseResolve = resolve;
        sleep(this.timing.pauseCheckMs).then(resolve);
      });
    }
  }

  async *complete(_request: CompletionRequest): AsyncIterable<CompletionChunk> {
    const step = this.steps[this.currentStepIndex];
    if (!step) {
      yield {
        type: "done",
        usage: { promptTokens: 0, completionTokens: 0 },
      };
      return;
    }

    let totalTokens = 0;

    for (const chunk of step.chunks) {
      // Check for pause
      await this.waitWhilePaused();
      if (this.signal?.aborted) break;

      switch (chunk.type) {
        case "text": {
          // Stream text character by character
          for await (const textChunk of streamText(
            chunk.content,
            this.timing.charDelayMs,
            this.signal
          )) {
            await this.waitWhilePaused();
            if (this.signal?.aborted) break;
            yield textChunk;
            totalTokens++;
          }
          break;
        }

        case "tool_call": {
          // Delay before tool call
          try {
            await delay(this.timing.toolCallDelayMs, this.signal);
          } catch {
            break;
          }
          yield {
            type: "tool_call",
            toolCall: chunk.toolCall,
          };
          totalTokens += 10; // Approximate tokens for tool call
          break;
        }

        case "delay": {
          try {
            await delay(chunk.ms, this.signal);
          } catch {
            break;
          }
          break;
        }
      }
    }

    // Yield completion
    yield {
      type: "done",
      usage: {
        promptTokens: Math.floor(totalTokens * 0.3),
        completionTokens: totalTokens,
      },
    };
  }
}

// Factory function for creating a mock provider with a scenario
export function createMockLLMProvider(
  steps: ScenarioStep[],
  options?: { timing?: Partial<MockTimingConfig>; signal?: AbortSignal }
): MockLLMProvider {
  return new MockLLMProvider({
    steps,
    timing: options?.timing,
    signal: options?.signal,
  });
}
