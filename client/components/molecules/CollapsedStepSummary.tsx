import React from "react";
import { cn } from "../../utils/index.ts";

export type CollapsedStepSummaryProps = {
  index: number;
  name: string;
  duration?: number;
  tokens?: number;
  onExpand: () => void;
  isEntering?: boolean;
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function CollapsedStepSummary({
  index,
  name,
  duration,
  tokens,
  onExpand,
  isEntering = false,
}: CollapsedStepSummaryProps) {
  return (
    <div
      className={cn(
        "collapsed-step-summary",
        isEntering && "collapsed-step-summary--entering"
      )}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand();
        }
      }}
      aria-expanded={false}
      aria-label={`Expand ${name}`}
    >
      <span className="collapsed-step-summary__index">{index + 1}</span>

      <span className="collapsed-step-summary__checkmark">
        <CheckIcon />
      </span>

      <span className="collapsed-step-summary__name">{name}</span>

      <span className="collapsed-step-summary__meta">
        {duration && <span>{formatDuration(duration)}</span>}
        {tokens && <span>{tokens} tokens</span>}
      </span>

      <span className="collapsed-step-summary__expand">
        <ChevronDownIcon />
      </span>
    </div>
  );
}
