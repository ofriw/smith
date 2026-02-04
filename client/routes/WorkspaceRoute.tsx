import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProjectContext, SessionProvider, useSessionContext } from "../contexts/index.ts";
import { PipelineLayout } from "../components/layouts/index.ts";
import { useKeyboardShortcuts } from "../hooks/index.ts";
import type { SchemaField } from "../components/organisms/SchemaForm.tsx";
import type { Step, ToolCall } from "../contexts/SessionContext.tsx";
import type { Step as PipelineStep, ToolCall as PipelineToolCall } from "../components/layouts/PipelineLayout.tsx";
import type { InitializeCardProps } from "../components/organisms/InitializeCard.tsx";
import {
  MockSessionRunner,
  getScenario,
  planExecuteScenario,
} from "../mocks/index.ts";

type WorkspaceState = {
  sessionId: string | null;
  workflowName: string | null;
  globalInputs: Record<string, unknown>;
};

const workflowGroups = [
  {
    title: "USER WORKFLOWS",
    workflows: [
      {
        id: "plan-execute",
        name: "Plan & Execute",
        description: "Research, plan, then execute",
        stepCount: 3,
      },
      {
        id: "quick-fix",
        name: "Quick Fix",
        description: "Fast bug fixing workflow",
        stepCount: 2,
      },
    ],
  },
  {
    title: "PROJECT WORKFLOWS",
    workflows: [
      {
        id: "custom",
        name: "Custom Workflow",
        description: "Project-specific workflow",
        stepCount: 1,
      },
    ],
  },
];

const inputSchema: SchemaField[] = [
  {
    name: "task",
    label: "Task Description",
    type: "text",
    required: true,
    placeholder: "What do you want to accomplish?",
  },
  {
    name: "scope",
    label: "File Scope",
    type: "string",
    placeholder: "src/**",
  },
];

type WorkflowSelectionProps = Omit<InitializeCardProps, 'isSessionActive' | 'activeWorkflowName'>;

function SessionContent({
  onEndSession,
  workflowSelection,
}: {
  onEndSession: () => void;
  workflowSelection: WorkflowSelectionProps;
}) {
  const session = useSessionContext();
  const runnerRef = useRef<MockSessionRunner | null>(null);

  const handleRewind = useCallback((stepIndex: number) => {
    session.setCurrentStepIndex(stepIndex);
    const updatedSteps = session.steps.map((s, i) => ({
      ...s,
      status: i < stepIndex ? "completed" : i === stepIndex ? "active" : "pending",
    } as Step));
    session.setSteps(updatedSteps);
  }, [session]);

  const handleRevert = useCallback((callId: string) => {
    session.updateToolCall(callId, { status: "error" });
  }, [session]);

  const handlePause = useCallback(() => {
    runnerRef.current?.pause();
  }, []);

  const handleContinue = useCallback(() => {
    runnerRef.current?.resume();
  }, []);

  useKeyboardShortcuts(
    {
      onPause: handlePause,
      onContinue: handleContinue,
      onSetExecutionMode: session.setExecutionMode,
    },
    {
      enabled: true,
      isRunning: session.status === "running",
      isPaused: session.status === "paused",
    }
  );

  const isRunning = session.status === "running";
  const isPaused = session.status === "paused";

  const pipelineSteps: PipelineStep[] = session.steps.map((s) => ({
    name: s.name,
    status: s.status as PipelineStep["status"],
    tokens: s.tokens,
    duration: s.duration,
  }));

  const pipelineToolCalls: PipelineToolCall[] = session.toolCalls.map((tc) => ({
    id: tc.id,
    toolName: tc.toolName,
    status: tc.status === "done" ? "done" : tc.status === "running" ? "running" : "error",
    stepName: tc.stepName || "",
    description: tc.description,
    input: tc.input,
    output: tc.output,
  }));

  const stepData = new Map<number, { inputData: Record<string, unknown>; outputData: Record<string, unknown> }>();
  stepData.set(session.currentStepIndex, {
    inputData: session.inputData,
    outputData: session.outputData,
  });

  return (
    <PipelineLayout
      steps={pipelineSteps}
      currentStepIndex={session.currentStepIndex}
      stepData={stepData}
      toolCalls={pipelineToolCalls}
      streamingOutput={session.streamingOutput}
      isRunning={isRunning}
      isPaused={isPaused}
      workflowName={session.workflowName}
      workflowSelection={workflowSelection}
      onPause={handlePause}
      onContinue={handleContinue}
      onRewind={handleRewind}
      onRevert={handleRevert}
      onEndSession={onEndSession}
    />
  );
}

function SessionRunner({ workflowName }: { workflowName: string }) {
  const session = useSessionContext();
  const runnerRef = useRef<MockSessionRunner | null>(null);
  const hasStarted = useRef(false);

  const callbacksRef = useRef(session);
  callbacksRef.current = session;

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const scenario = getScenario(workflowName) || planExecuteScenario;

    const runner = new MockSessionRunner({
      scenario,
      callbacks: {
        setStatus: (s) => callbacksRef.current.setStatus(s),
        setSteps: (s) => callbacksRef.current.setSteps(s),
        setCurrentStepIndex: (i) => callbacksRef.current.setCurrentStepIndex(i),
        appendStreamingOutput: (t) => callbacksRef.current.appendStreamingOutput(t),
        addToolCall: (c) => callbacksRef.current.addToolCall(c),
        updateToolCall: (id, u) => callbacksRef.current.updateToolCall(id, u),
        setError: (e) => callbacksRef.current.setError(e),
        setOutputData: (d) => callbacksRef.current.setOutputData(d),
      },
      timing: {
        charDelayMs: 8,
        toolCallDelayMs: 150,
        stepTransitionMs: 300,
        pauseCheckMs: 50,
      },
    });

    runnerRef.current = runner;

    runner.start().catch((error) => {
      console.error("Session runner error:", error);
      callbacksRef.current.setError(error.message);
      callbacksRef.current.setStatus("error");
    });

    return () => {
      runner.stop();
    };
  }, [workflowName]);

  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;

    if (session.status === "paused") {
      runner.pause();
    } else if (session.status === "running") {
      runner.resume();
    }
  }, [session.status]);

  return null;
}

export function WorkspaceRoute() {
  const { name, path, branch } = useProjectContext();

  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    sessionId: null,
    workflowName: null,
    globalInputs: {},
  });
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>();
  const [inputValues, setInputValues] = useState<Record<string, unknown>>({});

  const handleInputChange = (fieldName: string, value: unknown) => {
    setInputValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleWorkflowStart = () => {
    if (!selectedWorkflowId) return;

    const workflow = workflowGroups
      .flatMap((g) => g.workflows)
      .find((w) => w.id === selectedWorkflowId);

    if (!workflow) return;

    const sessionId = crypto.randomUUID();
    setWorkspaceState({
      sessionId,
      workflowName: workflow.name,
      globalInputs: inputValues,
    });
  };

  const handleEndSession = useCallback(() => {
    setWorkspaceState({
      sessionId: null,
      workflowName: null,
      globalInputs: {},
    });
    setSelectedWorkflowId(undefined);
    setInputValues({});
  }, []);

  const hasActiveSession = workspaceState.sessionId !== null;

  const workflowSelection: WorkflowSelectionProps = {
    workflowGroups,
    selectedWorkflowId,
    onWorkflowSelect: setSelectedWorkflowId,
    inputSchema,
    inputValues,
    onInputChange: handleInputChange,
    onStartWorkflow: handleWorkflowStart,
    isStartDisabled: !selectedWorkflowId,
  };

  return (
    <div className="workspace-layout">
      <header className="workspace-layout__header">
        <h1 className="workspace-layout__title">{name || "Project"}</h1>
        <span className="workspace-layout__branch">{branch || "main"}</span>
        <span className="workspace-layout__path">{path}</span>
      </header>

      <div className="workspace-layout__content">
        {hasActiveSession ? (
          <SessionProvider
            sessionId={workspaceState.sessionId!}
            workflowName={workspaceState.workflowName!}
            globalInputs={workspaceState.globalInputs}
          >
            <SessionRunner workflowName={workspaceState.workflowName!} />
            <SessionContent
              onEndSession={handleEndSession}
              workflowSelection={workflowSelection}
            />
          </SessionProvider>
        ) : (
          <PipelineLayout
            steps={[]}
            currentStepIndex={0}
            stepData={new Map()}
            toolCalls={[]}
            streamingOutput=""
            isRunning={false}
            isPaused={false}
            workflowSelection={workflowSelection}
            onPause={() => {}}
            onContinue={() => {}}
            onRewind={() => {}}
            onRevert={() => {}}
            onEndSession={() => {}}
          />
        )}
      </div>
    </div>
  );
}
