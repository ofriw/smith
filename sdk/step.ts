import type { StepDefinition, Tool, StepContext } from "@smith/common";

export interface StepBuilder {
  description(description: string): StepBuilder;
  provider(provider: string): StepBuilder;
  model(model: string): StepBuilder;
  systemPrompt(prompt: string | ((ctx: StepContext) => string)): StepBuilder;
  tools(tools: Tool[] | ((ctx: StepContext) => Tool[])): StepBuilder;
  maxTokens(tokens: number): StepBuilder;
  condition(fn: (ctx: StepContext) => boolean): StepBuilder;
  build(): StepDefinition;
}

export function step(name: string): StepBuilder {
  const config: Partial<StepDefinition> = { name };

  const builder: StepBuilder = {
    description(d: string) {
      config.description = d;
      return builder;
    },
    provider(p: string) {
      config.provider = p;
      return builder;
    },
    model(m: string) {
      config.model = m;
      return builder;
    },
    systemPrompt(prompt: string | ((ctx: StepContext) => string)) {
      config.systemPrompt = prompt;
      return builder;
    },
    tools(t: Tool[] | ((ctx: StepContext) => Tool[])) {
      config.tools = t;
      return builder;
    },
    maxTokens(tokens: number) {
      config.maxTokens = tokens;
      return builder;
    },
    condition(fn: (ctx: StepContext) => boolean) {
      config.condition = fn;
      return builder;
    },
    build(): StepDefinition {
      if (!config.name) throw new Error("Step name is required");
      return config as StepDefinition;
    },
  };

  return builder;
}
