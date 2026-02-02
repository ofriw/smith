import React, { useState } from "react";
import { Button } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";

export type FileChange = {
  id: string;
  toolName: string;
  filePath?: string;
  reverted: boolean;
};

export type FileChangesPanelProps = {
  changes: FileChange[];
  onRevert: (id: string) => void;
  className?: string;
};

export function FileChangesPanel({
  changes,
  onRevert,
  className = "",
}: FileChangesPanelProps) {
  const [visibleCount, setVisibleCount] = useState(15);
  const visibleChanges = changes.slice(0, visibleCount);
  const remainingCount = changes.length - visibleCount;
  const classNames = cn("file-changes-panel", className);

  return (
    <div className={classNames}>
      <div className="file-changes-panel__header">
        <h3 className="file-changes-panel__title">File Changes</h3>
        <span className="file-changes-panel__count">
          {changes.filter((c) => !c.reverted).length} changes
        </span>
      </div>

      <div className="file-changes-panel__list">
        {visibleChanges.map((change) => (
          <div
            key={change.id}
            className={cn(
              "file-changes-panel__item",
              change.reverted && "file-changes-panel__item--reverted",
            )}
          >
            <div className="file-changes-panel__item-info">
              <span className="file-changes-panel__tool-name">{change.toolName}</span>
              {change.filePath && (
                <span className="file-changes-panel__file-path">{change.filePath}</span>
              )}
            </div>
            {change.reverted ? (
              <span className="file-changes-panel__reverted">Reverted</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevert(change.id)}
              >
                Revert
              </Button>
            )}
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <button
          className="file-changes-panel__show-more"
          onClick={() => setVisibleCount(prev => prev + 15)}
        >
          Show {Math.min(remainingCount, 15)} more ({remainingCount} remaining)
        </button>
      )}

      <p className="file-changes-panel__note">
        Revert changes files only. Workflow state unchanged.
      </p>
    </div>
  );
}
