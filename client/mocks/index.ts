// Mock system exports

// Types
export type {
  MockTimingConfig,
  ScenarioStep,
  ScenarioChunk,
  Scenario,
  MockSessionConfig,
  MockToolResult,
} from "./types.ts";
export { DEFAULT_TIMING } from "./types.ts";

// Mock providers
export { MockLLMProvider, createMockLLMProvider } from "./MockLLMProvider.ts";
export { MockToolExecutor, createMockToolExecutor } from "./MockToolExecutor.ts";
export {
  MockSessionRunner,
  createMockSessionRunner,
} from "./MockSessionRunner.ts";
export type {
  SessionCallbacks,
  MockSessionRunnerOptions,
} from "./MockSessionRunner.ts";

// Scenarios
export { planExecuteScenario } from "./scenarios/plan-execute/index.ts";
export { quickFixScenario } from "./scenarios/quick-fix/index.ts";

// Scenario lookup
import { planExecuteScenario } from "./scenarios/plan-execute/index.ts";
import { quickFixScenario } from "./scenarios/quick-fix/index.ts";
import type { Scenario } from "./types.ts";

export const SCENARIOS: Record<string, Scenario> = {
  "Plan & Execute": planExecuteScenario,
  "Quick Fix": quickFixScenario,
};

export function getScenario(workflowName: string): Scenario | undefined {
  return SCENARIOS[workflowName];
}
