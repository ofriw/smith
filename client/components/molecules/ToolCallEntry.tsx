import React, { useState } from "react";
import { StatusBadge, IconButton } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";

export type ToolCallTiming = {
  startedAt: Date;
  finishedAt?: Date;
  durationMs?: number;
};

export type ToolCallTokens = {
  prompt: number;
  completion: number;
  total: number;
};

export type ToolCallEntryProps = {
  toolName: string;
  status: "running" | "done" | "error";
  description?: string;
  input?: string;
  output?: string;
  timing?: ToolCallTiming;
  tokens?: ToolCallTokens;
  filePaths?: string[];
  onRevert?: () => void;
  reverted?: boolean;
  expandable?: boolean;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function ToolCallEntry({
  toolName,
  status,
  description,
  input,
  output,
  timing,
  tokens,
  filePaths,
  onRevert,
  reverted = false,
  expandable = true,
}: ToolCallEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContent = description || input || output || filePaths?.length;
  const canExpand = expandable && hasContent;

  const className = cn(
    "tool-call-entry",
    expanded && "tool-call-entry--expanded",
    reverted && "tool-call-entry--reverted",
  );

  const handleHeaderClick = () => {
    if (canExpand) {
      setExpanded(!expanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (canExpand && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <div className={className}>
      <div
        className="tool-call-entry__header"
        onClick={handleHeaderClick}
        onKeyDown={handleKeyDown}
        role={canExpand ? "button" : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? expanded : undefined}
      >
        <span className="tool-call-entry__tool-name">{toolName}</span>
        <StatusBadge status={status} size="sm" />

        {timing?.durationMs !== undefined && (
          <span className="tool-call-entry__timing">
            {formatDuration(timing.durationMs)}
          </span>
        )}

        {tokens && (
          <span className="tool-call-entry__tokens" title={`Prompt: ${tokens.prompt}, Completion: ${tokens.completion}`}>
            {tokens.total.toLocaleString()} tokens
          </span>
        )}

        <div className="tool-call-entry__actions">
          {reverted && (
            <span className="tool-call-entry__revert-indicator">Reverted</span>
          )}
          {onRevert && !reverted && status === "done" && (
            <IconButton
              icon="revert"
              size="sm"
              variant="ghost"
              label="Revert this action"
              onClick={(e) => {
                e.stopPropagation();
                onRevert();
              }}
            />
          )}
          {canExpand && (
            <span className="tool-call-entry__expand">
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
          )}
        </div>
      </div>

      {hasContent && (
        <div className="tool-call-entry__body">
          <div className="tool-call-entry__body-inner">
            {description && (
              <p className="tool-call-entry__description">{description}</p>
            )}
            {filePaths && filePaths.length > 0 && (
              <div className="tool-call-entry__files">
                <span className="tool-call-entry__files-label">Files:</span>
                {filePaths.map((path, i) => (
                  <span key={i} className="tool-call-entry__file-path">
                    {path}
                  </span>
                ))}
              </div>
            )}
            {input && (
              <div className="tool-call-entry__section">
                <span className="tool-call-entry__section-label">Input</span>
                <pre className="tool-call-entry__input">{input}</pre>
              </div>
            )}
            {output && (
              <div className="tool-call-entry__section">
                <span className="tool-call-entry__section-label">Output</span>
                <pre className="tool-call-entry__output">{output}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
