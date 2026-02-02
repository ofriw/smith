import { DataRegistry } from "@goatdb/goatdb";
import { kSchemaSessionIndex } from "./session.ts";
import { kSchemaToolCallEdit } from "./tool-call.ts";
import { kSchemaStepTokenUsage } from "./token-usage.ts";
import { kSchemaGlobalSettings, kSchemaProjectSettings } from "./settings.ts";

export { kSchemaSessionIndex } from "./session.ts";
export { kSchemaToolCallEdit } from "./tool-call.ts";
export { kSchemaStepTokenUsage } from "./token-usage.ts";
export { kSchemaGlobalSettings, kSchemaProjectSettings } from "./settings.ts";

export function registerSchemas(
  registry: DataRegistry = DataRegistry.default,
): void {
  registry.registerSchema(kSchemaSessionIndex);
  registry.registerSchema(kSchemaToolCallEdit);
  registry.registerSchema(kSchemaStepTokenUsage);
  registry.registerSchema(kSchemaGlobalSettings);
  registry.registerSchema(kSchemaProjectSettings);
}
