import React, { useState } from "react";
import { StatusBadge, StatusBadgeStatus, Button, IconButton } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";

export type HistoryEntryProps = {
  id: string;
  timestamp: string;
  workflowName: string;
  status: StatusBadgeStatus;
  duration: string;
  filesModified: number;
  toolCalls: number;
  onReplay?: () => void;
  onViewEdits?: () => void;
  onView?: () => void;
  className?: string;
};

export function HistoryEntry({
  timestamp,
  workflowName,
  status,
  duration,
  filesModified,
  toolCalls,
  onReplay,
  onViewEdits,
  onView,
  className = "",
}: HistoryEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const classNames = cn(
    "history-entry",
    expanded && "history-entry--expanded",
    className,
  );

  return (
    <div className={classNames}>
      <div
        className="history-entry__header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="history-entry__main">
          <span className="history-entry__timestamp">{timestamp}</span>
          <span className="history-entry__workflow">{workflowName}</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <div className="history-entry__meta">
          <span className="history-entry__stat">{duration}</span>
          <span className="history-entry__stat">{filesModified} files</span>
          <span className="history-entry__stat">{toolCalls} calls</span>
        </div>
        <span className="history-entry__expand">
          <IconButton
            icon="expand"
            size="sm"
            variant="ghost"
            label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          />
        </span>
      </div>

      {expanded && (
        <div className="history-entry__body">
          <div className="history-entry__actions">
            {onReplay && (
              <Button variant="primary" size="sm" onClick={onReplay}>
                Replay
              </Button>
            )}
            {onViewEdits && (
              <Button variant="secondary" size="sm" onClick={onViewEdits}>
                View Edits
              </Button>
            )}
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                View
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
