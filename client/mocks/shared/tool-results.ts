// Tool result generators for realistic mock responses

import { getFileContent, FILE_CONTENTS } from "./file-contents.ts";
import type { MockToolResult } from "../types.ts";

// File read tool
export function fileReadResult(args: {
  path: string;
  startLine?: number;
  endLine?: number;
}): MockToolResult {
  const content = getFileContent(args.path, args.startLine, args.endLine);
  const lines = content.split("\n").length;
  return {
    content,
    metadata: { lines, bytes: content.length },
    delayMs: 50 + Math.random() * 100,
  };
}

// File write tool
export function fileWriteResult(args: {
  path: string;
  content: string;
}): MockToolResult {
  const oldContent = FILE_CONTENTS[args.path] || "";
  const diff = generateDiff(args.path, oldContent, args.content);
  return {
    content: diff,
    metadata: {
      bytesWritten: args.content.length,
      linesChanged: countDiffLines(diff),
    },
    delayMs: 100 + Math.random() * 150,
  };
}

// Glob tool
export function globResult(args: { pattern: string }): MockToolResult {
  const allFiles = Object.keys(FILE_CONTENTS);
  const matches = allFiles.filter((f) => matchGlob(f, args.pattern));
  return {
    content: JSON.stringify({ matches, totalFiles: matches.length }, null, 2),
    metadata: { matchCount: matches.length },
    delayMs: 80 + Math.random() * 70,
  };
}

// Grep tool
export function grepResult(args: {
  pattern: string;
  path?: string;
}): MockToolResult {
  const results: string[] = [];
  const filesToSearch = args.path
    ? [args.path]
    : Object.keys(FILE_CONTENTS);

  for (const file of filesToSearch) {
    const content = FILE_CONTENTS[file];
    if (!content) continue;

    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(args.pattern.toLowerCase())) {
        results.push(`${file}:${i + 1}:${line}`);
      }
    });
  }

  return {
    content: results.join("\n") || "No matches found",
    metadata: { matchCount: results.length },
    delayMs: 120 + Math.random() * 100,
  };
}

// Bash tool
export function bashResult(args: { command: string }): MockToolResult {
  const cmd = args.command.trim();

  // Simulate common commands
  if (cmd.startsWith("npm run typecheck")) {
    return {
      content: `> my-app@1.0.0 typecheck
> tsc --noEmit

Done in 2.3s`,
      metadata: { exitCode: 0 },
      delayMs: 500 + Math.random() * 500,
    };
  }

  if (cmd.startsWith("npm run test")) {
    return {
      content: `> my-app@1.0.0 test
> vitest

 ✓ src/auth/login.test.ts (3 tests) 45ms
 ✓ src/auth/session.test.ts (2 tests) 23ms

 Test Files  2 passed (2)
      Tests  5 passed (5)
   Start at  14:32:15
   Duration  1.24s`,
      metadata: { exitCode: 0 },
      delayMs: 800 + Math.random() * 400,
    };
  }

  if (cmd.startsWith("npm run lint")) {
    return {
      content: `> my-app@1.0.0 lint
> eslint src/

Done. No issues found.`,
      metadata: { exitCode: 0 },
      delayMs: 400 + Math.random() * 300,
    };
  }

  if (cmd.startsWith("git status")) {
    return {
      content: `On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)

	modified:   src/auth/login.ts
	modified:   src/auth/session.ts

no changes added to commit (use "git add" and/or "git commit -a")`,
      metadata: { exitCode: 0 },
      delayMs: 100,
    };
  }

  if (cmd.startsWith("git diff")) {
    return {
      content: `diff --git a/src/auth/login.ts b/src/auth/login.ts
index 1234567..abcdefg 100644
--- a/src/auth/login.ts
+++ b/src/auth/login.ts
@@ -4,7 +4,8 @@ import { SessionManager } from './session';

-const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
+const JWT_SECRET = process.env.JWT_SECRET;
+if (!JWT_SECRET) throw new Error('JWT_SECRET required');
 const SESSION_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS || '24');`,
      metadata: { exitCode: 0 },
      delayMs: 150,
    };
  }

  // Default response
  return {
    content: `$ ${cmd}\nCommand executed successfully`,
    metadata: { exitCode: 0 },
    delayMs: 200 + Math.random() * 200,
  };
}

// Helper: generate diff-style output
function generateDiff(
  path: string,
  oldContent: string,
  newContent: string
): string {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  let diff = `--- ${path}\n+++ ${path}\n`;

  // Simple diff: show first difference
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    if (oldLines[i] !== newLines[i]) {
      diff += `@@ -${i + 1},3 +${i + 1},3 @@\n`;
      if (oldLines[i]) diff += `-${oldLines[i]}\n`;
      if (newLines[i]) diff += `+${newLines[i]}\n`;
      // Show a few surrounding lines
      if (oldLines[i + 1]) diff += ` ${oldLines[i + 1]}\n`;
      if (oldLines[i + 2]) diff += ` ${oldLines[i + 2]}\n`;
      break;
    }
  }

  return diff;
}

// Helper: count changed lines in diff
function countDiffLines(diff: string): number {
  return (diff.match(/^[+-][^+-]/gm) || []).length;
}

// Helper: simple glob matching
function matchGlob(path: string, pattern: string): boolean {
  // Convert glob to regex
  const regex = new RegExp(
    "^" +
      pattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\?/g, ".") +
      "$"
  );
  return regex.test(path);
}
