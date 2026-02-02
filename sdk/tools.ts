import type { Tool } from "@smith/common";

/**
 * SDK Tool Definitions
 *
 * These are type definitions and metadata for built-in tools.
 * The `execute` stubs exist only for type compatibility - actual
 * execution happens server-side in server/tools/ implementations.
 *
 * Workflow authors use these to reference tools by name when
 * defining which tools a step can invoke.
 */

// Built-in tool references - actual implementations in server/tools/
export const read: Tool = {
  name: "read",
  description: "Read file contents",
  mode: "readonly",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to read" },
    },
    required: ["path"],
  },
  execute: async () => ({ content: "stub" }),
};

export const write: Tool = {
  name: "write",
  description: "Write file contents",
  mode: "edit",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path to write" },
      content: { type: "string", description: "Content to write" },
    },
    required: ["path", "content"],
  },
  execute: async () => ({ content: "stub" }),
};

export const glob: Tool = {
  name: "glob",
  description: "Find files matching a pattern",
  mode: "readonly",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Glob pattern" },
    },
    required: ["pattern"],
  },
  execute: async () => ({ content: "stub" }),
};

export const grep: Tool = {
  name: "grep",
  description: "Search file contents",
  mode: "readonly",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Search pattern" },
      path: { type: "string", description: "Path to search in" },
    },
    required: ["pattern"],
  },
  execute: async () => ({ content: "stub" }),
};

export const bash: Tool = {
  name: "bash",
  description: "Execute shell commands",
  mode: "edit",
  parameters: {
    type: "object",
    properties: {
      command: { type: "string", description: "Command to execute" },
    },
    required: ["command"],
  },
  execute: async () => ({ content: "stub" }),
};

// All built-in tools
export const builtins = [read, write, glob, grep, bash];
