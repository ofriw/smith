// Realistic file content templates for mock tool responses

export const FILE_CONTENTS: Record<string, string> = {
  "src/auth/login.ts": `import { sign, verify } from 'jsonwebtoken';
import { User } from './types';
import { SessionManager } from './session';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SESSION_HOURS = 24;

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
}

export async function validateToken(token: string): Promise<{ userId: string } | null> {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}`,

  "src/auth/session.ts": `import { randomBytes } from 'crypto';
import { db } from '../db';

const SESSION_HOURS = 24;

export class SessionManager {
  static async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;

    await db.refreshTokens.create({
      token,
      userId,
      expiresAt,
      createdAt: Date.now(),
    });

    return token;
  }

  static async validateRefreshToken(token: string): Promise<string | null> {
    const record = await db.refreshTokens.findOne({ token });
    if (!record || record.expiresAt < Date.now()) {
      return null;
    }
    return record.userId;
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await db.refreshTokens.delete({ token });
  }
}`,

  "src/auth/types.ts": `export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}`,

  "src/auth/middleware.ts": `import { Request, Response, NextFunction } from 'express';
import { validateToken } from './login';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const payload = validateToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  (req as any).userId = payload.userId;
  next();
}`,

  "src/index.ts": `import express from 'express';
import { authRouter } from './auth/routes';
import { apiRouter } from './api/routes';
import { authMiddleware } from './auth/middleware';

const app = express();
app.use(express.json());

// Public routes
app.use('/auth', authRouter);

// Protected routes
app.use('/api', authMiddleware, apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,

  "package.json": `{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.2",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}`,

  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,
};

// Get file content with optional line range
export function getFileContent(
  path: string,
  startLine?: number,
  endLine?: number
): string {
  const content = FILE_CONTENTS[path];
  if (!content) {
    return `// File not found: ${path}`;
  }

  if (startLine === undefined) {
    return content;
  }

  const lines = content.split("\n");
  const start = Math.max(0, startLine - 1);
  const end = endLine ? Math.min(lines.length, endLine) : lines.length;
  return lines.slice(start, end).join("\n");
}
