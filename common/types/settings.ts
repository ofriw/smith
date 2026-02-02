export interface Settings {
  providers: Record<string, ProviderConfig>;
  defaults: DefaultSettings;
  tools?: ToolSettings;
}

export interface ProviderConfig {
  type: "openai" | "anthropic" | "ollama" | "custom";
  baseUrl?: string;
  apiKey?: string;
  models?: string[];
}

export interface DefaultSettings {
  provider: string;
  model: string;
  maxTokens: number;
}

export interface ToolSettings {
  enabled?: string[];
  disabled?: string[];
  mcp?: MCPConfig[];
}

export interface MCPConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
