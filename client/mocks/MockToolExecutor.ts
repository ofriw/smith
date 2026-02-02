import type { MockToolResult } from "./types.ts";
import {
  fileReadResult,
  fileWriteResult,
  globResult,
  grepResult,
  bashResult,
} from "./shared/tool-results.ts";
import { sleep } from "@goatdb/goatdb";

// Tool handlers by name
const TOOL_HANDLERS: Record<
  string,
  (args: Record<string, unknown>) => MockToolResult
> = {
  file_read: (args) =>
    fileReadResult(args as { path: string; startLine?: number; endLine?: number }),

  file_write: (args) =>
    fileWriteResult(args as { path: string; content: string }),

  glob: (args) => globResult(args as { pattern: string }),

  grep: (args) => grepResult(args as { pattern: string; path?: string }),

  bash: (args) => bashResult(args as { command: string }),

  // LLM query tool (simulated)
  llm_query: (_args) => ({
    content: "Analysis complete. The code follows best practices.",
    metadata: { model: "claude-3-opus", tokens: 150 },
    delayMs: 500,
  }),

  // Search tool
  search: (args) => ({
    content: JSON.stringify(
      {
        results: [
          { file: "src/auth/login.ts", line: 15, snippet: "async function authenticateUser" },
          { file: "src/auth/session.ts", line: 8, snippet: "static async createRefreshToken" },
        ],
        totalResults: 2,
      },
      null,
      2
    ),
    metadata: { searchType: "semantic" },
    delayMs: 200,
  }),
};

/**
 * MockToolExecutor executes mock tool calls with realistic results and delays.
 */
export class MockToolExecutor {
  private toolOverrides: Map<string, (args: unknown) => Promise<MockToolResult>>;

  constructor() {
    this.toolOverrides = new Map();
  }

  /**
   * Register a custom handler for a tool name.
   * This allows scenarios to override default behavior.
   */
  registerTool(
    name: string,
    handler: (args: unknown) => Promise<MockToolResult>
  ): void {
    this.toolOverrides.set(name, handler);
  }

  /**
   * Execute a tool call and return the result.
   */
  async execute(name: string, args: unknown): Promise<MockToolResult> {
    // Check for override first
    const override = this.toolOverrides.get(name);
    if (override) {
      return override(args);
    }

    // Use built-in handler
    const handler = TOOL_HANDLERS[name];
    if (!handler) {
      return {
        content: `Unknown tool: ${name}`,
        metadata: { error: true },
        delayMs: 50,
      };
    }

    const result = handler(args as Record<string, unknown>);

    // Apply delay if specified
    if (result.delayMs) {
      await sleep(result.delayMs);
    }

    return result;
  }
}

/**
 * Create a default mock tool executor instance.
 */
export function createMockToolExecutor(): MockToolExecutor {
  return new MockToolExecutor();
}
