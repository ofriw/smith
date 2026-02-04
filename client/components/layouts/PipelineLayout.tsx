import React, { useRef, useEffect } from "react";
import { ExecutionControls } from "../organisms/ExecutionControls.tsx";
import { InitializeCard } from "../organisms/InitializeCard.tsx";
import type { InitializeCardProps } from "../organisms/InitializeCard.tsx";
import { StepSection } from "../molecules/StepSection.tsx";
import { ToolCallEntry } from "../molecules/ToolCallEntry.tsx";
import { DataSummary } from "../molecules/DataSummary.tsx";
import type { SelectOption } from "../atoms/index.ts";

export type StepStatus = "pending" | "active" | "completed" | "error";

export type Step = {
  name: string;
  status: StepStatus;
  tokens?: number;
  duration?: number;
};

export type ToolCall = {
  id: string;
  toolName: string;
  status: "running" | "done" | "error";
  stepName: string;
  description?: string;
  input?: string;
  output?: string;
};

type StepData = {
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
};

export type PipelineLayoutProps = {
  steps: Step[];
  currentStepIndex: number;
  stepData: Map<number, StepData>;
  toolCalls: ToolCall[];
  streamingOutput: string;
  isRunning: boolean;
  isPaused: boolean;
  workflowName?: string;
  workflowSelection?: Omit<InitializeCardProps, 'isSessionActive' | 'activeWorkflowName'>;
  onPause: () => void;
  onContinue: () => void;
  onRewind: (stepIndex: number) => void;
  onRevert: (callId: string) => void;
  onEndSession: () => void;
};

function StepBlock({
  step,
  stepIndex,
  isActive,
  inputData,
  outputData,
  toolCalls,
  streamingOutput,
  onRevert,
  onRewind,
}: {
  step: Step;
  stepIndex: number;
  isActive: boolean;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  toolCalls: ToolCall[];
  streamingOutput?: string;
  onRevert: (callId: string) => void;
  onRewind?: () => void;
}) {
  const statusClass = `step--${step.status}`;
  const activeClass = isActive ? "step--active" : "";

  return (
    <section className={`step ${statusClass} ${activeClass}`}>
      <header className="step__header">
        <span className="step__index">{stepIndex + 1}</span>
        <h2 className="step__name">{step.name}</h2>
        <div className="step__metrics">
          {step.tokens && (
            <span className="step__tokens">{step.tokens} tokens</span>
          )}
          {step.duration && (
            <span className="step__duration">{step.duration}ms</span>
          )}
        </div>
        {onRewind && step.status === "completed" && (
          <button className="step__rewind" onClick={onRewind}>
            Rewind
          </button>
        )}
      </header>

      <StepSection title="Input" stepStatus={step.status}>
        <DataSummary data={inputData} />
      </StepSection>

      <StepSection
        title="Tool Calls"
        count={toolCalls.length}
        stepStatus={step.status}
      >
        {toolCalls.length === 0 ? (
          <span className="step__empty">No tool calls</span>
        ) : (
          toolCalls.map((tc) => (
            <ToolCallEntry
              key={tc.id}
              toolName={tc.toolName}
              status={tc.status}
              description={tc.description}
              input={tc.input}
              output={tc.output}
              onRevert={tc.status === "done" ? () => onRevert(tc.id) : undefined}
            />
          ))
        )}
      </StepSection>

      <StepSection title="Output" stepStatus={step.status}>
        {streamingOutput ? (
          <pre className="step__streaming">{streamingOutput}</pre>
        ) : Object.keys(outputData).length > 0 ? (
          <DataSummary data={outputData} />
        ) : (
          <span className="step__empty">No output yet</span>
        )}
      </StepSection>
    </section>
  );
}

export function PipelineLayout({
  steps,
  currentStepIndex,
  stepData,
  toolCalls,
  streamingOutput,
  isRunning,
  isPaused,
  workflowName = "Workflow",
  workflowSelection,
  onPause,
  onContinue,
  onRewind,
  onRevert,
  onEndSession,
}: PipelineLayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [currentStepIndex, toolCalls.length, streamingOutput]);

  const rewindOptions: SelectOption[] = steps
    .slice(0, currentStepIndex)
    .map((step, index) => ({
      value: String(index),
      label: step.name,
    }));

  const getToolCallsForStep = (stepName: string): ToolCall[] => {
    return toolCalls.filter((tc) => tc.stepName === stepName);
  };

  const isSessionActive = steps.length > 0 || isRunning;

  // Only show completed and active steps in main area
  const visibleSteps = steps.filter((_, i) => i <= currentStepIndex);
  const nextStep = steps[currentStepIndex + 1];

  return (
    <div className="pipeline-layout">
      <main className="pipeline-layout__main" ref={mainRef}>
        {workflowSelection && (
          <InitializeCard
            {...workflowSelection}
            isSessionActive={isSessionActive}
            activeWorkflowName={workflowName}
          />
        )}

        {workflowSelection && isSessionActive && visibleSteps.length > 0 && (
          <hr className="step-divider" />
        )}

        {visibleSteps.map((step, index) => {
          const data = stepData.get(index);
          const isActive = index === currentStepIndex;
          const stepToolCalls = getToolCallsForStep(step.name);

          return (
            <React.Fragment key={step.name}>
              <StepBlock
                step={step}
                stepIndex={index}
                isActive={isActive}
                inputData={data?.inputData ?? {}}
                outputData={data?.outputData ?? {}}
                toolCalls={stepToolCalls}
                streamingOutput={isActive ? streamingOutput : undefined}
                onRevert={onRevert}
                onRewind={
                  step.status === "completed"
                    ? () => onRewind(index)
                    : undefined
                }
              />
              {index < visibleSteps.length - 1 && <hr className="step-divider" />}
            </React.Fragment>
          );
        })}
      </main>

      <footer className="pipeline-layout__footer">
        {nextStep && (
          <div className="upcoming-step">
            <span className="upcoming-step__label">Next:</span>
            <span className="upcoming-step__name">{nextStep.name}</span>
          </div>
        )}
        <ExecutionControls
          isRunning={isRunning}
          isPaused={isPaused}
          onPause={onPause}
          onContinue={onContinue}
          rewindOptions={rewindOptions}
          onRewind={(stepId: string) => onRewind(parseInt(stepId, 10))}
          onEndSession={onEndSession}
        />
      </footer>
    </div>
  );
}
