// Settings schemas for GoatDB persistence

export const kSchemaGlobalSettings = {
  ns: "global-settings",
  version: 1,
  fields: {
    theme: { type: "string", default: () => "system" },
    firstLaunchComplete: { type: "boolean", default: () => false },
    defaultModel: { type: "string" },
    maxTokens: { type: "number" },
    temperature: { type: "number" },
    density: { type: "string", default: () => "default" },
    radius: { type: "string", default: () => "default" },
    fontScale: { type: "string", default: () => "default" },
    accentColor: { type: "string", default: () => "blue" },
  },
} as const;

export const kSchemaProjectSettings = {
  ns: "project-settings",
  version: 1,
  fields: {
    projectId: { type: "string", required: true },
    path: { type: "string" },
    name: { type: "string" },
    branch: { type: "string" },
    defaultModel: { type: "string" },
    maxTokens: { type: "number" },
    temperature: { type: "number" },
  },
} as const;
