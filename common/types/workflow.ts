import type { Tool } from "./tool.ts";

export interface WorkflowDefinition<TInputs = Record<string, unknown>> {
  name: string;
  description?: string;
  inputs: InputDefinition<TInputs>;
  steps: StepDefinition[];
}

export interface InputDefinition<T> {
  schema: T;
  defaults?: Partial<T>;
}

export interface StepDefinition {
  name: string;
  description?: string;
  provider?: string; // LLM provider key
  model?: string;
  systemPrompt?: string | ((ctx: StepContext) => string);
  tools?: Tool[] | ((ctx: StepContext) => Tool[]);
  maxTokens?: number;
  inputResolver?: InputResolver;
  condition?: (ctx: StepContext) => boolean;
}

export interface StepContext {
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export type InputResolver = (ctx: StepContext) => Record<string, unknown>;
