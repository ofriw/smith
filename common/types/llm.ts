export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResultMessage[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: unknown;
}

export interface ToolResultMessage {
  toolCallId: string;
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
}

export interface JSONSchema {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  properties?: Record<string, JSONSchema>;
  required?: string[];
  description?: string;
  items?: JSONSchema;
  enum?: unknown[];
  additionalProperties?: boolean | JSONSchema;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
}

export interface CompletionRequest {
  model: string;
  systemPrompt: string;
  messages: Message[];
  tools: ToolDefinition[];
  maxTokens: number;
}

export interface CompletionChunk {
  type: "text" | "tool_call" | "done";
  content?: string;
  toolCall?: { id: string; name: string; arguments: unknown };
  usage?: { promptTokens: number; completionTokens: number };
}

export interface LLMProvider {
  complete(request: CompletionRequest): AsyncIterable<CompletionChunk>;
}
