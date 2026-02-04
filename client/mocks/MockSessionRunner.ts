import type { CompletionChunk, ToolCall } from "../../common/types/llm.ts";
import type { SessionStatus, Step, ToolCall as TimelineCall } from "../contexts/SessionContext.tsx";
import { MockLLMProvider } from "./MockLLMProvider.ts";
import { MockToolExecutor } from "./MockToolExecutor.ts";
import type { Scenario, MockTimingConfig, ScenarioStep } from "./types.ts";
import { DEFAULT_TIMING } from "./types.ts";

export type SessionCallbacks = {
  setStatus: (status: SessionStatus) => void;
  setSteps: (steps: Step[]) => void;
  setCurrentStepIndex: (index: number) => void;
  appendStreamingOutput: (text: string) => void;
  addToolCall: (call: TimelineCall) => void;
  updateToolCall: (id: string, updates: Partial<TimelineCall>) => void;
  setError: (error: string | null) => void;
  setOutputData: (data: Record<string, unknown>) => void;
};

export type MockSessionRunnerOptions = {
  scenario: Scenario;
  callbacks: SessionCallbacks;
  timing?: Partial<MockTimingConfig>;
};

/**
 * MockSessionRunner orchestrates the execution of a mock scenario,
 * driving the SessionContext through realistic state transitions.
 */
export class MockSessionRunner {
  private scenario: Scenario;
  private callbacks: SessionCallbacks;
  private timing: MockTimingConfig;
  private llmProvider: MockLLMProvider;
  private toolExecutor: MockToolExecutor;
  private abortController: AbortController;
  private currentStepIndex = 0;
  private isPaused = false;
  private toolCallCounter = 0;

  constructor(options: MockSessionRunnerOptions) {
    this.scenario = options.scenario;
    this.callbacks = options.callbacks;
    this.timing = { ...DEFAULT_TIMING, ...options.timing };
    this.abortController = new AbortController();

    // Create providers
    this.llmProvider = new MockLLMProvider({
      steps: this.scenario.steps,
      timing: this.timing,
      signal: this.abortController.signal,
    });

    this.toolExecutor = new MockToolExecutor();
  }

  /**
   * Start the session execution.
   */
  async start(): Promise<void> {
    // Initialize steps
    const steps: Step[] = this.scenario.steps.map((s, i) => ({
      name: s.name,
      status: i === 0 ? "active" : "pending",
    }));
    this.callbacks.setSteps(steps);
    this.callbacks.setStatus("running");
    this.callbacks.setCurrentStepIndex(0);

    // Execute each step
    for (let i = 0; i < this.scenario.steps.length; i++) {
      if (this.abortController.signal.aborted) break;

      this.currentStepIndex = i;
      this.llmProvider.setCurrentStep(i);
      this.callbacks.setCurrentStepIndex(i);

      // Update step status
      this.updateStepStatus(i, "active");

      // Execute the step
      await this.executeStep(this.scenario.steps[i]);

      if (this.abortController.signal.aborted) break;

      // Mark step completed
      this.updateStepStatus(i, "completed");

      // Delay before next step
      if (i < this.scenario.steps.length - 1) {
        await this.delay(this.timing.stepTransitionMs);
      }
    }

    // Complete session if not aborted
    if (!this.abortController.signal.aborted) {
      this.callbacks.setStatus("completed");
    }
  }

  /**
   * Execute a single step.
   */
  private async executeStep(step: ScenarioStep): Promise<void> {
    this.callbacks.appendStreamingOutput(`\n--- ${step.name} ---\n\n`);

    // Get completion stream
    const stream = this.llmProvider.complete({
      model: "mock",
      systemPrompt: "",
      messages: [],
      tools: [],
      maxTokens: 1000,
    });

    for await (const chunk of stream) {
      if (this.abortController.signal.aborted) break;

      // Wait while paused
      await this.waitWhilePaused();

      await this.processChunk(chunk);
    }
  }

  /**
   * Process a single completion chunk.
   */
  private async processChunk(chunk: CompletionChunk): Promise<void> {
    switch (chunk.type) {
      case "text": {
        if (chunk.content) {
          this.callbacks.appendStreamingOutput(chunk.content);
        }
        break;
      }

      case "tool_call": {
        if (chunk.toolCall) {
          await this.handleToolCall(chunk.toolCall);
        }
        break;
      }

      case "done": {
        // Update output data with usage stats
        if (chunk.usage) {
          this.callbacks.setOutputData({
            promptTokens: chunk.usage.promptTokens,
            completionTokens: chunk.usage.completionTokens,
          });
        }
        break;
      }
    }
  }

  /**
   * Handle a tool call: add to timeline, execute, update result.
   */
  private async handleToolCall(toolCall: ToolCall): Promise<void> {
    const callId = `tool-${++this.toolCallCounter}`;

    // Add tool call to timeline
    const timelineCall: TimelineCall = {
      id: callId,
      toolName: toolCall.name,
      status: "running",
      description: this.getToolDescription(toolCall),
      input: JSON.stringify(toolCall.arguments, null, 2),
    };
    this.callbacks.addToolCall(timelineCall);

    // Execute the tool
    try {
      const result = await this.toolExecutor.execute(
        toolCall.name,
        toolCall.arguments
      );

      // Update tool call with result
      this.callbacks.updateToolCall(callId, {
        status: "done",
        output: result.content,
      });

      // Append result to streaming output
      this.callbacks.appendStreamingOutput(
        `\n[Tool ${toolCall.name}]: ${result.content.slice(0, 200)}${result.content.length > 200 ? "..." : ""}\n\n`
      );
    } catch (error) {
      // Handle tool error
      this.callbacks.updateToolCall(callId, {
        status: "error",
        output: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Generate a human-readable description for a tool call.
   */
  private getToolDescription(toolCall: ToolCall): string {
    const args = toolCall.arguments as Record<string, unknown>;
    switch (toolCall.name) {
      case "file_read":
        return `Reading ${args.path}`;
      case "file_write":
        return `Writing ${args.path}`;
      case "glob":
        return `Finding files matching ${args.pattern}`;
      case "grep":
        return `Searching for "${args.pattern}"`;
      case "bash":
        return `Running: ${String(args.command).slice(0, 50)}`;
      case "llm_query":
        return "Querying language model";
      default:
        return `Executing ${toolCall.name}`;
    }
  }

  /**
   * Update the status of a specific step.
   */
  private updateStepStatus(
    index: number,
    status: "pending" | "active" | "completed"
  ): void {
    const steps = this.scenario.steps.map((s, i) => ({
      name: s.name,
      status:
        i < index
          ? "completed"
          : i === index
            ? status
            : "pending",
    })) as Step[];
    this.callbacks.setSteps(steps);
  }

  /**
   * Pause execution.
   */
  pause(): void {
    this.isPaused = true;
    this.llmProvider.pause();
    this.callbacks.setStatus("paused");
  }

  /**
   * Resume execution.
   */
  resume(): void {
    this.isPaused = false;
    this.llmProvider.resume();
    this.callbacks.setStatus("running");
  }

  /**
   * Stop execution.
   */
  stop(): void {
    this.abortController.abort();
    this.callbacks.setStatus("idle");
  }

  /**
   * Wait while paused.
   */
  private async waitWhilePaused(): Promise<void> {
    while (this.isPaused && !this.abortController.signal.aborted) {
      await this.delay(this.timing.pauseCheckMs);
    }
  }

  /**
   * Delay helper.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const signal = this.abortController.signal;
      const onAbort = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      const timeoutId = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }
}

/**
 * Create and start a mock session runner.
 */
export function createMockSessionRunner(
  options: MockSessionRunnerOptions
): MockSessionRunner {
  return new MockSessionRunner(options);
}
