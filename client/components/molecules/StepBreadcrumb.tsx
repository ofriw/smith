import React, { useState, useEffect } from "react";
import { ProgressDot, IconButton } from "../atoms/index.ts";
import type { ProgressDotState } from "../atoms/index.ts";
import { ConfirmDialog } from "../organisms/ConfirmDialog.tsx";

export type Step = {
  name: string;
  status: "pending" | "active" | "completed" | "error";
  startedAt?: Date;
  completedAt?: Date;
  tokens?: number;
  model?: string;
};

export type StepBreadcrumbProps = {
  steps: Step[];
  onRewind?: (stepIndex: number) => void;
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatElapsed(startedAt: Date): string {
  const ms = Date.now() - startedAt.getTime();
  return formatDuration(ms);
}

function stepStatusToDotState(status: Step["status"]): ProgressDotState {
  return status;
}

function ElapsedTimer({ startedAt }: { startedAt: Date }) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return <span className="step-breadcrumb__elapsed">{elapsed}</span>;
}

export function StepBreadcrumb({ steps, onRewind }: StepBreadcrumbProps) {
  const [rewindTarget, setRewindTarget] = useState<{
    index: number;
    name: string;
  } | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleRewindClick = (index: number, name: string) => {
    setRewindTarget({ index, name });
  };

  const handleRewindConfirm = () => {
    if (rewindTarget && onRewind) {
      onRewind(rewindTarget.index);
    }
    setRewindTarget(null);
  };

  const getStepDuration = (step: Step): string | null => {
    if (step.startedAt && step.completedAt) {
      const ms = step.completedAt.getTime() - step.startedAt.getTime();
      return formatDuration(ms);
    }
    return null;
  };

  return (
    <>
      <nav className="step-breadcrumb" aria-label="Workflow progress">
        {steps.map((step, index) => {
          const duration = getStepDuration(step);
          const showMetrics =
            hoveredStep === index &&
            step.status === "completed" &&
            (duration || step.tokens || step.model);

          return (
            <React.Fragment key={index}>
              <div
                className={`step-breadcrumb__step step-breadcrumb__step--${step.status}`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="step-breadcrumb__step-main">
                  <ProgressDot state={stepStatusToDotState(step.status)} />
                  <span className="step-breadcrumb__label">{step.name}</span>

                  {/* Elapsed time for active step */}
                  {step.status === "active" && step.startedAt && (
                    <ElapsedTimer startedAt={step.startedAt} />
                  )}

                  {/* Rewind button inside completed step */}
                  {onRewind && step.status === "completed" && (
                    <IconButton
                      icon="rewind"
                      size="sm"
                      variant="ghost"
                      label={`Rewind to ${step.name}`}
                      onClick={() => handleRewindClick(index, step.name)}
                      className="step-breadcrumb__rewind-btn"
                    />
                  )}
                </div>

                {/* Metrics tooltip on hover */}
                {showMetrics && (
                  <div className="step-breadcrumb__metrics">
                    {duration && (
                      <span className="step-breadcrumb__metric">
                        {duration}
                      </span>
                    )}
                    {step.tokens && (
                      <span className="step-breadcrumb__metric">
                        {step.tokens.toLocaleString()} tokens
                      </span>
                    )}
                    {step.model && (
                      <span className="step-breadcrumb__metric">
                        {step.model}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="step-breadcrumb__connector">
                  <span className="step-breadcrumb__line" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <ConfirmDialog
        open={rewindTarget !== null}
        onClose={() => setRewindTarget(null)}
        onConfirm={handleRewindConfirm}
        title="Rewind Workflow"
        message={`Are you sure you want to rewind to "${rewindTarget?.name}"?`}
        warning="This will discard all progress after this step. This action cannot be undone."
        confirmLabel="Rewind"
        cancelLabel="Cancel"
        variant="warning"
      />
    </>
  );
}
