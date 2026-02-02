import React, { useState } from "react";
import { StatusBadge, StatusBadgeStatus, IconButton, Button } from "../atoms/index.ts";

export type StepCompletionCardProps = {
  stepName: string;
  status: StatusBadgeStatus;
  inputSummary: string;
  outputSummary: string;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  onView?: () => void;
  onEditFork?: () => void;
  onRewind?: () => void;
  className?: string;
};

export function StepCompletionCard({
  stepName,
  status,
  inputSummary,
  outputSummary,
  inputData,
  outputData,
  onView,
  onEditFork,
  onRewind,
  className = "",
}: StepCompletionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const classNames = [
    "step-completion-card",
    expanded && "step-completion-card--expanded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div
        className="step-completion-card__header"
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
        <div className="step-completion-card__info">
          <span className="step-completion-card__name">{stepName}</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <div className="step-completion-card__summary">
          <span className="step-completion-card__summary-item">
            <span className="step-completion-card__summary-label">Inputs:</span>
            {inputSummary}
          </span>
          <span className="step-completion-card__summary-divider">|</span>
          <span className="step-completion-card__summary-item">
            <span className="step-completion-card__summary-label">Outputs:</span>
            {outputSummary}
          </span>
        </div>
        <span className="step-completion-card__expand">
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
        <div className="step-completion-card__body">
          {inputData && (
            <div className="step-completion-card__panel">
              <h4 className="step-completion-card__panel-title">Inputs</h4>
              <pre className="step-completion-card__data">
                {JSON.stringify(inputData, null, 2)}
              </pre>
            </div>
          )}
          {outputData && (
            <div className="step-completion-card__panel">
              <h4 className="step-completion-card__panel-title">Outputs</h4>
              <pre className="step-completion-card__data">
                {JSON.stringify(outputData, null, 2)}
              </pre>
            </div>
          )}
          <div className="step-completion-card__actions">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                View
              </Button>
            )}
            {onEditFork && (
              <Button variant="ghost" size="sm" onClick={onEditFork}>
                Edit & Fork
              </Button>
            )}
            {onRewind && (
              <Button variant="ghost" size="sm" onClick={onRewind}>
                Rewind to Here
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
