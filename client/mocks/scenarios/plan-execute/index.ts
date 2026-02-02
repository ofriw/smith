// Plan & Execute scenario - 3 step workflow demo
import type { Scenario, ScenarioChunk } from "../../types.ts";
import {
  RESEARCH_TEXT,
  PLAN_TEXT,
  EXECUTE_TEXT,
} from "../../shared/streaming-text.ts";

// Research step chunks
const researchChunks: ScenarioChunk[] = [
  { type: "text", content: RESEARCH_TEXT },
  { type: "delay", ms: 200 },
  {
    type: "tool_call",
    toolCall: {
      id: "1",
      name: "glob",
      arguments: { pattern: "src/auth/**" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "2",
      name: "file_read",
      arguments: { path: "src/auth/login.ts" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "3",
      name: "file_read",
      arguments: { path: "src/auth/session.ts" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "4",
      name: "grep",
      arguments: { pattern: "SESSION_HOURS" },
    },
  },
];

// Plan step chunks
const planChunks: ScenarioChunk[] = [
  { type: "text", content: PLAN_TEXT },
  { type: "delay", ms: 300 },
  {
    type: "tool_call",
    toolCall: {
      id: "5",
      name: "file_read",
      arguments: { path: "package.json" },
    },
  },
];

// Execute step chunks
const executeChunks: ScenarioChunk[] = [
  { type: "text", content: "Starting implementation...\n\n" },
  { type: "delay", ms: 200 },
  { type: "text", content: "## Task 1: Implementing refresh token rotation\n\n" },
  {
    type: "tool_call",
    toolCall: {
      id: "6",
      name: "file_read",
      arguments: { path: "src/auth/session.ts" },
    },
  },
  { type: "delay", ms: 150 },
  {
    type: "tool_call",
    toolCall: {
      id: "7",
      name: "file_write",
      arguments: {
        path: "src/auth/session.ts",
        content: `import { randomBytes } from 'crypto';
import { db } from '../db';

const SESSION_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24');

export class SessionManager {
  static async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
    const generation = await this.getNextGeneration(userId);

    await db.refreshTokens.create({
      token,
      userId,
      expiresAt,
      generation,
      createdAt: Date.now(),
    });

    return token;
  }

  static async rotateRefreshToken(oldToken: string): Promise<string | null> {
    const record = await db.refreshTokens.findOne({ token: oldToken });
    if (!record || record.expiresAt < Date.now()) {
      return null;
    }

    // Invalidate old token
    await db.refreshTokens.delete({ token: oldToken });

    // Create new token
    return this.createRefreshToken(record.userId);
  }

  private static async getNextGeneration(userId: string): Promise<number> {
    const latest = await db.refreshTokens.findOne(
      { userId },
      { sort: { generation: -1 } }
    );
    return (latest?.generation || 0) + 1;
  }
}`,
      },
    },
  },
  { type: "text", content: "\nUpdated session.ts with token rotation.\n\n" },
  { type: "delay", ms: 200 },
  { type: "text", content: "## Task 2: Making session expiry configurable\n\n" },
  {
    type: "tool_call",
    toolCall: {
      id: "8",
      name: "file_write",
      arguments: {
        path: "src/auth/login.ts",
        content: `import { sign, verify } from 'jsonwebtoken';
import { User } from './types';
import { SessionManager } from './session';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable required');

const SESSION_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24');

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ token: string; refreshToken: string } | null> {
  const user = await User.findByEmail(email);
  if (!user || !await user.verifyPassword(password)) {
    return null;
  }

  const token = sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: \`\${SESSION_HOURS}h\`
  });

  const refreshToken = await SessionManager.createRefreshToken(user.id);

  return { token, refreshToken };
}`,
      },
    },
  },
  { type: "text", content: "\nUpdated login.ts with configurable expiry.\n\n" },
  { type: "delay", ms: 200 },
  { type: "text", content: "## Running verification checks...\n\n" },
  {
    type: "tool_call",
    toolCall: {
      id: "9",
      name: "bash",
      arguments: { command: "npm run typecheck" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "10",
      name: "bash",
      arguments: { command: "npm run test" },
    },
  },
  { type: "delay", ms: 100 },
  {
    type: "tool_call",
    toolCall: {
      id: "11",
      name: "bash",
      arguments: { command: "npm run lint" },
    },
  },
  {
    type: "text",
    content: `
All changes complete. Summary:
- Modified 2 files (login.ts, session.ts)
- Added refresh token rotation
- Made session expiry configurable
- All tests passing
`,
  },
];

export const planExecuteScenario: Scenario = {
  name: "Plan & Execute",
  description: "Research, plan, then execute implementation",
  steps: [
    { name: "Research", chunks: researchChunks },
    { name: "Plan", chunks: planChunks },
    { name: "Execute", chunks: executeChunks },
  ],
};
