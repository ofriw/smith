import type { GoatDB, ManagedItem } from "@goatdb/goatdb";
import { kSchemaSessionIndex } from "@smith/common";

const REGISTRY_PATH = "/sys/registry";

export interface SessionRegistryEntry {
  sessionId: string;
  workflowName: string;
  status: "active" | "completed" | "error" | "ended";
  startedAt: Date;
  finishedAt?: Date;
  filesModified: number;
  toolCallCount: number;
  totalTokens: number;
}

export function createSession(
  db: GoatDB,
  entry: Omit<SessionRegistryEntry, "startedAt" | "filesModified" | "toolCallCount" | "totalTokens">
): string {
  const key = `${REGISTRY_PATH}/${entry.sessionId}`;

  db.create(key, kSchemaSessionIndex, {
    sessionId: entry.sessionId,
    workflowName: entry.workflowName,
    status: entry.status,
    startedAt: new Date(),
    filesModified: 0,
    toolCallCount: 0,
    totalTokens: 0,
  });

  return entry.sessionId;
}

export function getSession(
  db: GoatDB,
  sessionId: string
): SessionRegistryEntry | null {
  const key = `${REGISTRY_PATH}/${sessionId}`;
  const item = db.item(key) as ManagedItem | undefined;

  if (!item) return null;

  return {
    sessionId: item.get("sessionId") as string,
    workflowName: item.get("workflowName") as string,
    status: item.get("status") as SessionRegistryEntry["status"],
    startedAt: item.get("startedAt") as Date,
    finishedAt: item.get("finishedAt") as Date | undefined,
    filesModified: item.get("filesModified") as number,
    toolCallCount: item.get("toolCallCount") as number,
    totalTokens: item.get("totalTokens") as number,
  };
}

export function updateSessionStatus(
  db: GoatDB,
  sessionId: string,
  status: SessionRegistryEntry["status"],
  finishedAt?: Date
): void {
  const key = `${REGISTRY_PATH}/${sessionId}`;
  const item = db.item(key) as ManagedItem | undefined;

  if (!item) throw new Error(`Session not found: ${sessionId}`);

  item.set("status", status);
  if (finishedAt) {
    item.set("finishedAt", finishedAt);
  }
}

export function listSessions(
  db: GoatDB
): SessionRegistryEntry[] {
  const entries: SessionRegistryEntry[] = [];

  // Iterate over items under the registry path
  for (const key of db.keys(REGISTRY_PATH)) {
    const item = db.item(key) as ManagedItem | undefined;
    if (!item) continue;

    entries.push({
      sessionId: item.get("sessionId") as string,
      workflowName: item.get("workflowName") as string,
      status: item.get("status") as SessionRegistryEntry["status"],
      startedAt: item.get("startedAt") as Date,
      finishedAt: item.get("finishedAt") as Date | undefined,
      filesModified: item.get("filesModified") as number,
      toolCallCount: item.get("toolCallCount") as number,
      totalTokens: item.get("totalTokens") as number,
    });
  }

  // Sort by startedAt descending (most recent first)
  entries.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  return entries;
}
