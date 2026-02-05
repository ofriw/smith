import React, { useRef, useEffect, useState, useCallback } from "react";
import { InitializeCard } from "../organisms/InitializeCard.tsx";
import type { InitializeCardProps } from "../organisms/InitializeCard.tsx";
import { StepSection } from "../molecules/StepSection.tsx";
import { ToolCallEntry } from "../molecules/ToolCallEntry.tsx";
import { DataSummary } from "../molecules/DataSummary.tsx";
import { CollapsedStepSummary } from "../molecules/CollapsedStepSummary.tsx";
import { useScrollSync } from "../../hooks/useScrollSync.ts";
import { cn } from "../../utils/index.ts";

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

type StepBlockProps = {
  step: Step;
  stepIndex: number;
  isActive: boolean;
  isPendingNext: boolean;
  isPendingLater: boolean;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  toolCalls: ToolCall[];
  streamingOutput?: string;
  onRevert: (callId: string) => void;
  onRewind?: () => void;
  animationClass?: string;
  registerRef?: (el: HTMLElement | null) => void;
};

function StepBlock({
  step,
  stepIndex,
  isActive,
  isPendingNext,
  isPendingLater,
  inputData,
  outputData,
  toolCalls,
  streamingOutput,
  onRevert,
  onRewind,
  animationClass = "",
  registerRef,
}: StepBlockProps) {
  const classNames = cn(
    "step",
    `step--${step.status}`,
    isActive && "step--active",
    isPendingNext && "step--teaser",
    isPendingLater && "step--pending-later",
    animationClass
  );

  return (
    <section className={classNames} ref={registerRef}>
      <header className="step__header">
        <span className="step__index">{stepIndex + 1}</span>
        <h2 className="step__name">{step.name}</h2>
        {!isPendingNext && !isPendingLater && (
          <div className="step__metrics">
            {step.tokens && (
              <span className="step__tokens">{step.tokens} tokens</span>
            )}
            {step.duration && (
              <span className="step__duration">{step.duration}ms</span>
            )}
          </div>
        )}
        {onRewind && step.status === "completed" && (
          <button className="step__rewind" onClick={onRewind}>
            Rewind
          </button>
        )}
      </header>

      {/* Only show content for active and completed steps */}
      {step.status !== "pending" && (
        <>
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
        </>
      )}
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
  const {
    containerRef,
    registerStepRef,
    scrollToStep,
    scrollToBottom,
    isUserScrolled,
    resetUserScroll,
  } = useScrollSync();

  const [expandedCompletedSteps, setExpandedCompletedSteps] = useState<Set<number>>(new Set());
  const [transitioningSteps, setTransitioningSteps] = useState<Map<number, string>>(new Map());
  const prevStepIndexRef = useRef(currentStepIndex);
  const prevStreamingLengthRef = useRef(streamingOutput.length);

  // Auto-scroll on step change
  useEffect(() => {
    if (prevStepIndexRef.current !== currentStepIndex) {
      const prevIndex = prevStepIndexRef.current;
      prevStepIndexRef.current = currentStepIndex;

      // Animation sequence
      setTransitioningSteps((prev) => {
        const next = new Map(prev);
        if (prevIndex >= 0 && prevIndex < steps.length) {
          next.set(prevIndex, "step--completing");
        }
        next.set(currentStepIndex, "step--entering");
        return next;
      });

      // Auto-scroll to new step after animation delay
      const scrollTimeout = setTimeout(() => {
        if (!isUserScrolled) {
          scrollToStep(currentStepIndex);
        }
      }, 150);

      // Clear animation classes after completion
      const cleanupTimeout = setTimeout(() => {
        setTransitioningSteps(new Map());
      }, 300);

      return () => {
        clearTimeout(scrollTimeout);
        clearTimeout(cleanupTimeout);
      };
    }
  }, [currentStepIndex, steps.length, isUserScrolled, scrollToStep]);

  // Auto-scroll on streaming content growth (only if user hasn't scrolled away)
  useEffect(() => {
    const newLength = streamingOutput.length;
    const hadContent = prevStreamingLengthRef.current > 0;
    const hasNewContent = newLength > prevStreamingLengthRef.current;

    prevStreamingLengthRef.current = newLength;

    // Only scroll when content grows and user hasn't scrolled away
    if (hasNewContent && !isUserScrolled && isRunning) {
      scrollToBottom();
    }
  }, [streamingOutput.length, isUserScrolled, isRunning, scrollToBottom]);

  const handleScrollToBottomClick = useCallback(() => {
    resetUserScroll();
    scrollToBottom();
  }, [resetUserScroll, scrollToBottom]);

  const getToolCallsForStep = (stepName: string): ToolCall[] => {
    return toolCalls.filter((tc) => tc.stepName === stepName);
  };

  const toggleStepExpanded = useCallback((index: number) => {
    setExpandedCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const isSessionActive = steps.length > 0 || isRunning;
  const showScrollButton = isUserScrolled && isRunning;

  return (
    <div className="pipeline-layout">
      <main className="pipeline-layout__main" ref={containerRef}>
        {workflowSelection && (
          <InitializeCard
            {...workflowSelection}
            isSessionActive={isSessionActive}
            activeWorkflowName={workflowName}
          />
        )}

        {workflowSelection && isSessionActive && steps.length > 0 && (
          <hr className="step-divider" />
        )}

        {/* Show ALL steps */}
        {steps.map((step, index) => {
          const data = stepData.get(index);
          const isActive = index === currentStepIndex;
          const isCompleted = step.status === "completed";
          const isPending = step.status === "pending";
          const isPendingNext = isPending && index === currentStepIndex + 1;
          const isPendingLater = isPending && index > currentStepIndex + 1;
          const isExpanded = expandedCompletedSteps.has(index);
          const animationClass = transitioningSteps.get(index) || "";
          const stepToolCalls = getToolCallsForStep(step.name);

          // Completed but not expanded: show collapsed summary
          if (isCompleted && !isExpanded && !isActive) {
            return (
              <React.Fragment key={`${step.name}-${index}`}>
                <CollapsedStepSummary
                  index={index}
                  name={step.name}
                  duration={step.duration}
                  tokens={step.tokens}
                  onExpand={() => toggleStepExpanded(index)}
                  isEntering={animationClass === "step--completing"}
                />
                {index < steps.length - 1 && <hr className="step-divider" />}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`${step.name}-${index}`}>
              <StepBlock
                step={step}
                stepIndex={index}
                isActive={isActive}
                isPendingNext={isPendingNext}
                isPendingLater={isPendingLater}
                inputData={data?.inputData ?? {}}
                outputData={data?.outputData ?? {}}
                toolCalls={stepToolCalls}
                streamingOutput={isActive ? streamingOutput : undefined}
                onRevert={onRevert}
                onRewind={
                  isCompleted && isExpanded
                    ? () => onRewind(index)
                    : undefined
                }
                animationClass={animationClass}
                registerRef={(el) => registerStepRef(index, el)}
              />
              {index < steps.length - 1 && <hr className="step-divider" />}
            </React.Fragment>
          );
        })}
      </main>

      {showScrollButton && (
        <button
          className="pipeline-layout__scroll-to-bottom"
          onClick={handleScrollToBottomClick}
          aria-label="Scroll to bottom"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12L3 7h10L8 12z" />
          </svg>
          Resume auto-scroll
        </button>
      )}
    </div>
  );
}
