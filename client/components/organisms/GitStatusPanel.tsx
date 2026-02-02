import React from "react";
import { Button } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";

export type GitFileStatus = "M" | "A" | "D" | "R" | "?";

export type GitFile = {
  path: string;
  status: GitFileStatus;
};

export type GitStatusPanelProps = {
  files: GitFile[];
  onViewDiff?: (path: string) => void;
  className?: string;
};

const statusLabels: Record<GitFileStatus, string> = {
  M: "Modified",
  A: "Added",
  D: "Deleted",
  R: "Renamed",
  "?": "Untracked",
};

export function GitStatusPanel({
  files,
  onViewDiff,
  className = "",
}: GitStatusPanelProps) {
  const classNames = cn("git-status-panel", className);

  return (
    <div className={classNames}>
      <div className="git-status-panel__header">
        <h3 className="git-status-panel__title">Git Status</h3>
        <span className="git-status-panel__count">{files.length} files</span>
      </div>

      <div className="git-status-panel__list">
        {files.map((file) => (
          <div key={file.path} className="git-status-panel__item">
            <span
              className={`git-status-panel__status git-status-panel__status--${file.status.toLowerCase()}`}
              title={statusLabels[file.status]}
            >
              {file.status}
            </span>
            <span className="git-status-panel__path">{file.path}</span>
            {onViewDiff && file.status !== "?" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDiff(file.path)}
              >
                View Diff
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
