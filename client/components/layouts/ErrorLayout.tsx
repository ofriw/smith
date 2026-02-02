import React from "react";
import { SelectOption } from "../atoms/index.ts";
import { StepBreadcrumb, Step } from "../molecules/index.ts";
import { TimelinePanel, ToolCallEntryData } from "../organisms/index.ts";
import { ErrorStateCard } from "../organisms/ErrorStateCard.tsx";
import { RecoveryActions } from "../organisms/RecoveryActions.tsx";
import { cn } from "../../utils/index.ts";

export type ErrorLayoutProps = {
  steps: Step[];
  errorStepIndex: number;
  toolCalls: ToolCallEntryData[];
  errorTitle?: string;
  fileReference?: string;
  errorMessage: string;
  fullStack?: string;
  revertOptions: SelectOption[];
  onRevert: (toolCallId: string) => void;
  rewindOptions: SelectOption[];
  onRewind: (stepId: string) => void;
  onRetry: () => void;
  onEditFork: () => void;
  onEndSession: () => void;
  className?: string;
};

export function ErrorLayout({
  steps,
  errorStepIndex,
  toolCalls,
  errorTitle,
  fileReference,
  errorMessage,
  fullStack,
  revertOptions,
  onRevert,
  rewindOptions,
  onRewind,
  onRetry,
  onEditFork,
  onEndSession,
  className = "",
}: ErrorLayoutProps) {
  const classNames = cn("error-layout", className);

  // Mark error step
  const stepsWithError = steps.map((step, i) => ({
    ...step,
    status: i === errorStepIndex ? "error" as const : step.status,
  }));

  return (
    <div className={classNames}>
      <header className="error-layout__header">
        <StepBreadcrumb steps={stepsWithError} onRewind={onRewind} />
      </header>

      <main className="error-layout__main">
        <div className="error-layout__left">
          <ErrorStateCard
            title={errorTitle}
            fileReference={fileReference}
            errorMessage={errorMessage}
            fullStack={fullStack}
          />

          <RecoveryActions
            onRetry={onRetry}
            revertOptions={revertOptions}
            onRevert={onRevert}
            rewindOptions={rewindOptions}
            onRewind={onRewind}
            onEditFork={onEditFork}
            onEndSession={onEndSession}
          />
        </div>

        <div className="error-layout__right">
          <TimelinePanel
            calls={toolCalls}
            title="Last Tool Calls"
          />
        </div>
      </main>
    </div>
  );
}
