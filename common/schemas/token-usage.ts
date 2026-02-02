// Token usage per step - stored in: /data/sessions/<session-id>/usage/<step-name>
export const kSchemaStepTokenUsage = {
  ns: "step-token-usage",
  version: 1,
  fields: {
    stepName: { type: "string", required: true },
    model: { type: "string", required: true }, // provider:model
    promptTokens: { type: "number", default: () => 0 },
    completionTokens: { type: "number", default: () => 0 },
    totalTokens: { type: "number", default: () => 0 },
    requestCount: { type: "number", default: () => 0 },
  },
} as const;
