import { useMemo } from "react";
import { useQuery } from "@goatdb/goatdb/react";
import { kSchemaSessionIndex } from "@smith/common";

export type HistoryEntry = {
  id: string;
  timestamp: string;
  workflowName: string;
  status: "done" | "error";
  duration: string;
  filesModified: number;
  toolCalls: number;
};

function formatDuration(startedAt: Date, finishedAt: Date): string {
  const durationMs = finishedAt.getTime() - startedAt.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function useSessionHistory() {
  const query = useQuery({
    schema: kSchemaSessionIndex,
    source: "/sys/registry",
  });

  const entries = useMemo<HistoryEntry[]>(() => {
    const results = query.results();
    return results
      .filter((item) => {
        const status = item.get("status") as string;
        return status === "completed" || status === "error";
      })
      .map((item) => {
        const startedAt = item.get("startedAt") as Date;
        const finishedAt = item.get("finishedAt") as Date | undefined;
        const status = item.get("status") as string;

        return {
          id: item.get("sessionId") as string,
          timestamp: formatTimestamp(startedAt),
          workflowName: item.get("workflowName") as string,
          status: status === "error" ? "error" : "done",
          duration: finishedAt ? formatDuration(startedAt, finishedAt) : "0m 0s",
          filesModified: (item.get("filesModified") as number) ?? 0,
          toolCalls: (item.get("toolCallCount") as number) ?? 0,
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [query]);

  return entries;
}
