import type { CompletionChunk, ToolCall } from "../../common/types/llm.ts";

// Timing configuration for mock execution
export type MockTimingConfig = {
  charDelayMs: number;      // Delay per character (typing effect)
  toolCallDelayMs: number;  // Delay before tool execution
  stepTransitionMs: number; // Delay between steps
  pauseCheckMs: number;     // Interval for pause responsiveness
};

export const DEFAULT_TIMING: MockTimingConfig = {
  charDelayMs: 15,
  toolCallDelayMs: 300,
  stepTransitionMs: 500,
  pauseCheckMs: 50,
};

// Scenario step definition
export type ScenarioStep = {
  name: string;
  chunks: ScenarioChunk[];
};

// A chunk in a scenario can be text, tool call, or delay
export type ScenarioChunk =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: ToolCall }
  | { type: "delay"; ms: number };

// Full scenario definition
export type Scenario = {
  name: string;
  description: string;
  steps: ScenarioStep[];
};

// Mock session configuration
export type MockSessionConfig = {
  scenario: Scenario;
  timing: MockTimingConfig;
  onChunk?: (chunk: CompletionChunk) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onToolResult?: (toolCallId: string, result: string) => void;
  onStepComplete?: (stepIndex: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
};

// Tool execution result
export type MockToolResult = {
  content: string;
  metadata?: Record<string, unknown>;
  delayMs?: number;
};
