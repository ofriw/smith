import type { JSONSchema } from "./llm.ts";

export type { JSONSchema };

export interface Tool {
  name: string;
  description: string;
  mode: "readonly" | "edit";
  parameters: JSONSchema;
  execute(input: unknown): Promise<ToolResult>;
}

export interface ToolResult {
  content: string;
  metadata?: Record<string, unknown>;
}
