// Tool call recording schema - one item per file-modifying tool call
// Stored in: /data/sessions/<session-id>/calls/<call-id>
export const kSchemaToolCallEdit = {
  ns: "tool-call-edit",
  version: 1,
  fields: {
    callId: { type: "string", required: true },
    stepName: { type: "string", required: true },
    toolName: { type: "string", required: true },
    callIndex: { type: "number", required: true },
    timestamp: { type: "date", required: true, default: () => new Date() },
    description: { type: "string" }, // Agent's WHY reasoning
    input: { type: "map" },
    snapshots: { type: "map" }, // Record<path, content> - file state BEFORE
    results: { type: "map" }, // Record<path, content> - file state AFTER
    revertState: { type: "map" }, // Record<path, 'applied' | 'reverted'>
  },
} as const;
