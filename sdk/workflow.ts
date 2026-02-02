import type { WorkflowDefinition, InputDefinition, StepDefinition } from "@smith/common";

export interface WorkflowBuilder<TInputs = Record<string, unknown>> {
  name: string;
  description?: string;
  inputs: InputDefinition<TInputs>;
  steps: StepDefinition[];
}

export function defineWorkflow<TInputs = Record<string, unknown>>(
  config: WorkflowBuilder<TInputs>
): WorkflowDefinition<TInputs> {
  return {
    name: config.name,
    description: config.description,
    inputs: config.inputs,
    steps: config.steps,
  };
}
