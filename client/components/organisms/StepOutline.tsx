import React from "react";
import type { StepStatus } from "../layouts/PipelineLayout.tsx";
import { cn } from "../../utils/index.ts";

export type OutlineStep = {
  name: string;
  status: StepStatus;
  tokens?: number;
  duration?: number;
};

export type StepOutlineProps = {
  steps: OutlineStep[];
  currentStepIndex: number;
  expandedSteps: Set<number>;
  onStepClick: (index: number) => void;
  onToggleExpand?: (index: number) => void;
};

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokens(count: number): string {
  if (count < 1000) return `${count}`;
  return `${(count / 1000).toFixed(1)}k`;
}

export function StepOutline({
  steps,
  currentStepIndex,
  expandedSteps,
  onStepClick,
  onToggleExpand,
}: StepOutlineProps) {
  if (steps.length === 0) {
    return (
      <div className="step-outline">
        <div className="step-outline__empty">
          No active workflow
        </div>
      </div>
    );
  }

  return (
    <nav className="step-outline" aria-label="Pipeline steps">
      {steps.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isExpanded = expandedSteps.has(index);
        const isCompleted = step.status === "completed";

        return (
          <div
            key={`${step.name}-${index}`}
            className={cn(
              "step-outline-item",
              `step-outline-item--${step.status}`,
              isCurrent && "step-outline-item--current"
            )}
            onClick={() => onStepClick(index)}
            role="button"
            tabIndex={0}
            aria-current={isCurrent ? "step" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onStepClick(index);
              }
            }}
          >
            <div className="step-outline-item__indicator">
              <span className="step-outline-item__dot" />
            </div>

            <div className="step-outline-item__content">
              <div className="step-outline-item__name">
                {step.name}
              </div>
              {(step.duration || step.tokens) && (
                <div className="step-outline-item__meta">
                  {step.duration && (
                    <span className="step-outline-item__duration">
                      {formatDuration(step.duration)}
                    </span>
                  )}
                  {step.tokens && (
                    <span className="step-outline-item__tokens">
                      {formatTokens(step.tokens)} tokens
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="step-outline-item__index">{index + 1}</span>

            {isCompleted && onToggleExpand && (
              <button
                className="step-outline-item__expand"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(index);
                }}
                aria-label={isExpanded ? "Collapse step" : "Expand step"}
                aria-expanded={isExpanded}
              >
                <ChevronIcon />
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
