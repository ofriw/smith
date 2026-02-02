// Quick Fix scenario - 2 step workflow demo
import type { Scenario, ScenarioChunk } from "../../types.ts";
import { ANALYZE_TEXT, FIX_TEXT } from "../../shared/streaming-text.ts";

// Analyze step chunks
const analyzeChunks: ScenarioChunk[] = [
  { type: "text", content: "Diagnosing the issue...\n\n" },
  { type: "delay", ms: 150 },
  { type: "text", content: "Searching for error patterns in the codebase:\n\n" },
  {
    type: "tool_call",
    toolCall: {
      id: "1",
      name: "grep",
      arguments: { pattern: "validateToken" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "2",
      name: "file_read",
      arguments: { path: "src/auth/middleware.ts" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "text",
    content: `
Found the root cause in src/auth/middleware.ts:8

The validateToken function is being called with a potentially
empty token when the Authorization header is malformed.

The current code assumes the header always has "Bearer " prefix:

\`\`\`typescript
const token = authHeader.slice(7);  // Assumes "Bearer " prefix
\`\`\`

This fails when:
1. Header doesn't start with "Bearer "
2. Header is exactly "Bearer" with no token
3. Token contains invalid characters
`,
  },
  {
    type: "tool_call",
    toolCall: {
      id: "3",
      name: "grep",
      arguments: { pattern: "authHeader" },
    },
  },
  {
    type: "text",
    content: "\nThe fix should validate the header format before extraction.\n",
  },
];

// Fix step chunks
const fixChunks: ScenarioChunk[] = [
  { type: "text", content: "Implementing the fix...\n\n" },
  { type: "delay", ms: 150 },
  {
    type: "tool_call",
    toolCall: {
      id: "4",
      name: "file_read",
      arguments: { path: "src/auth/middleware.ts" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "text",
    content: "Adding header validation before token extraction:\n\n",
  },
  {
    type: "tool_call",
    toolCall: {
      id: "5",
      name: "file_write",
      arguments: {
        path: "src/auth/middleware.ts",
        content: `import { Request, Response, NextFunction } from 'express';
import { validateToken } from './login';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Validate header format
  if (!authHeader?.startsWith('Bearer ') || authHeader.length <= 7) {
    res.status(401).json({ error: 'Invalid authorization header format' });
    return;
  }

  const token = authHeader.slice(7);

  // Validate token is not empty or whitespace
  if (!token.trim()) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const payload = validateToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as any).userId = payload.userId;
  next();
}`,
      },
    },
  },
  { type: "delay", ms: 200 },
  { type: "text", content: "\nRunning tests to verify the fix...\n\n" },
  {
    type: "tool_call",
    toolCall: {
      id: "6",
      name: "bash",
      arguments: { command: "npm run test" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "7",
      name: "bash",
      arguments: { command: "npm run typecheck" },
    },
  },
  {
    type: "text",
    content: `
All tests passing:
- auth/middleware.test.ts: 5 passed
- integration/auth.test.ts: 6 passed

Fix complete. The middleware now properly validates:
- Header prefix format
- Token presence
- Token validity
`,
  },
];

export const quickFixScenario: Scenario = {
  name: "Quick Fix",
  description: "Analyze issue and implement fix",
  steps: [
    { name: "Analyze", chunks: analyzeChunks },
    { name: "Fix", chunks: fixChunks },
  ],
};
