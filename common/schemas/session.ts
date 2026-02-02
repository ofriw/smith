// Valid session status values
export const SESSION_STATUS_VALUES = ["active", "completed", "error", "ended"] as const;
export type SessionStatus = typeof SESSION_STATUS_VALUES[number];

// Session registry schema - one item per workflow execution
// Stored in: /sys/registry/<session-id>
export const kSchemaSessionIndex = {
  ns: "session-index",
  version: 1,
  fields: {
    sessionId: { type: "string", required: true },
    workflowName: { type: "string", required: true },
    inputs: { type: "map" },
    status: { type: "string", required: true },
    startedAt: { type: "date", required: true, default: () => new Date() },
    finishedAt: { type: "date" },
    filesModified: { type: "number", default: () => 0 },
    toolCallCount: { type: "number", default: () => 0 },
    totalTokens: { type: "number", default: () => 0 },
    tokensByModel: { type: "map" },
    parentSessionId: { type: "string" }, // If forked
    forkPoint: { type: "map" }, // { stepName, dataType }
  },
} as const;
