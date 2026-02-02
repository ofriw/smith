import React from "react";
import { SelectOption } from "../atoms/index.ts";
import { StepBreadcrumb, Step } from "../molecules/index.ts";
import { IOPanel, TimelinePanel, ToolCallEntryData } from "../organisms/index.ts";
import { ExecutionModeToggle, ExecutionMode } from "../organisms/ExecutionModeToggle.tsx";
import { ExecutionControls } from "../organisms/ExecutionControls.tsx";
import { StreamingOutput } from "../organisms/StreamingOutput.tsx";

export type ActiveSessionLayoutProps = {
  steps: Step[];
  onRewind: (stepId: string) => void;
  executionMode: ExecutionMode;
  onExecutionModeChange: (mode: ExecutionMode) => void;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  onInputChange?: (data: Record<string, unknown>) => void;
  toolCalls: ToolCallEntryData[];
  onRevertToolCall?: (id: string) => void;
  streamingOutput: string;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onContinue: () => void;
  rewindOptions: SelectOption[];
  onEndSession: () => void;
  children?: React.ReactNode;
};

export function ActiveSessionLayout({
  steps,
  onRewind,
  executionMode,
  onExecutionModeChange,
  inputData,
  outputData,
  onInputChange,
  toolCalls,
  onRevertToolCall,
  streamingOutput,
  isRunning,
  isPaused,
  onPause,
  onContinue,
  rewindOptions,
  onEndSession,
  children,
}: ActiveSessionLayoutProps) {
  return (
    <div className="active-session-layout">
      <header className="active-session-layout__header">
        <div className="active-session-layout__breadcrumb">
          <StepBreadcrumb steps={steps} onRewind={onRewind} />
        </div>
        <div className="active-session-layout__mode">
          <ExecutionModeToggle
            value={executionMode}
            onChange={onExecutionModeChange}
            showDescriptions={false}
            disabled={isRunning && !isPaused}
          />
        </div>
      </header>

      <main className="active-session-layout__main">
        <div className="active-session-layout__left">
          <div className="active-session-layout__io">
            <IOPanel
              title="Step Inputs"
              data={inputData}
              editable={isPaused}
              onChange={onInputChange}
            />
            <IOPanel
              title="Step Outputs"
              data={outputData}
            />
          </div>
          <div className="active-session-layout__output">
            <StreamingOutput content={streamingOutput} />
          </div>
        </div>

        <div className="active-session-layout__right">
          <TimelinePanel
            calls={toolCalls}
            onRevert={onRevertToolCall}
          />
        </div>
      </main>

      <footer className="active-session-layout__footer">
        <ExecutionControls
          isRunning={isRunning}
          isPaused={isPaused}
          onPause={onPause}
          onContinue={onContinue}
          rewindOptions={rewindOptions}
          onRewind={onRewind}
          onEndSession={onEndSession}
        />
      </footer>

      {children}
    </div>
  );
}
