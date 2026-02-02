import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { SessionProvider, useSessionContext, useProjectContext } from "../contexts/index.ts";
import { useSessionRouteInfo } from "../AppShell.tsx";
import { useKeyboardShortcuts } from "../hooks/index.ts";
import {
  ActiveSessionLayout,
  CompletionLayout,
  ErrorLayout,
} from "../components/layouts/index.ts";
import type { Step } from "../components/molecules/StepBreadcrumb.tsx";
import {
  MockSessionRunner,
  getScenario,
  planExecuteScenario,
} from "../mocks/index.ts";

function SessionContent() {
  const { id: projectId } = useProjectContext();
  const session = useSessionContext();
  const runnerRef = useRef<MockSessionRunner | null>(null);

  const handleEndSession = useCallback(() => {
    runnerRef.current?.stop();
    window.location.hash = `/project/${projectId}`;
  }, [projectId]);

  const handleRewind = useCallback((stepId: string) => {
    const stepIndex = parseInt(stepId, 10);
    if (isNaN(stepIndex)) return;
    session.setCurrentStepIndex(stepIndex);
    const updatedSteps = session.steps.map((s, i) => ({
      ...s,
      status: i < stepIndex ? "completed" : i === stepIndex ? "active" : "pending",
    } as Step));
    session.setSteps(updatedSteps);
  }, [session]);

  const handlePause = useCallback(() => {
    runnerRef.current?.pause();
  }, []);

  const handleContinue = useCallback(() => {
    runnerRef.current?.resume();
  }, []);

  // Keyboard shortcuts
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

  // Map session status to layout status
  const isRunning = session.status === "running";
  const isPaused = session.status === "paused";

  // Generate stable step breakdown once per session completion
  const stepBreakdown = useMemo(() => {
    if (session.status !== "completed") return [];
    // Use step index as seed for deterministic "random" values
    return session.steps.map((step, i) => ({
      step: step.name,
      duration: `${(i % 3)}m ${((i * 17) % 60)}s`,
      tokens: 1000 + ((i * 1234) % 5000),
      model: i === session.steps.length - 1 ? "claude-3-sonnet" : "claude-3-opus",
    }));
  }, [session.status, session.steps]);

  if (session.status === "completed") {

    const fileChanges = session.toolCalls
      .filter((tc) => tc.toolName === "file_write")
      .map((tc) => ({
        id: tc.id,
        toolName: tc.toolName,
        filePath: tc.description?.replace("Writing ", "") || "unknown",
        reverted: false,
      }));

    return (
      <CompletionLayout
        workflowName={session.workflowName}
        stats={[
          {
            label: "Duration",
            value: session.startedAt && session.completedAt
              ? `${Math.floor((session.completedAt.getTime() - session.startedAt.getTime()) / 1000 / 60)}m ${Math.floor((session.completedAt.getTime() - session.startedAt.getTime()) / 1000) % 60}s`
              : "0m 0s",
          },
          { label: "Tokens", value: "12,453" },
          { label: "Files", value: String(fileChanges.length) },
          { label: "Tool Calls", value: String(session.toolCalls.length) },
        ]}
        stepBreakdown={stepBreakdown}
        fileChanges={fileChanges}
        onRevertFileChange={() => {}}
        verificationItems={[
          { label: "TypeScript", status: "pass" },
          { label: "ESLint", status: "pass" },
          { label: "Tests", status: "pass" },
        ]}
        gitFiles={fileChanges.map((fc) => ({
          path: fc.filePath,
          status: "M" as const,
        }))}
        onViewDiff={() => {}}
        rewindOptions={session.steps.map((s, i) => ({ value: String(i), label: s.name }))}
        onRewind={() => {}}
        onNewWorkflow={handleEndSession}
      />
    );
  }

  if (session.status === "error") {
    return (
      <ErrorLayout
        steps={session.steps}
        errorStepIndex={session.currentStepIndex}
        toolCalls={session.toolCalls}
        fileReference="src/auth/login.ts:42"
        errorMessage={session.error || "Unknown error"}
        fullStack="at AuthService.login (src/auth/login.ts:42)"
        revertOptions={session.toolCalls
          .filter((tc) => tc.toolName === "file_write")
          .map((tc) => ({ value: tc.id, label: `Revert ${tc.toolName}` }))}
        onRevert={() => {}}
        rewindOptions={session.steps.map((s, i) => ({ value: String(i), label: `Rewind to ${s.name}` }))}
        onRewind={() => {}}
        onRetry={() => session.setStatus("running")}
        onEditFork={() => {}}
        onEndSession={handleEndSession}
      />
    );
  }

  return (
    <ActiveSessionLayout
      steps={session.steps}
      onRewind={handleRewind}
      executionMode={session.executionMode}
      onExecutionModeChange={session.setExecutionMode}
      inputData={session.inputData}
      outputData={session.outputData}
      toolCalls={session.toolCalls}
      streamingOutput={session.streamingOutput}
      isRunning={isRunning}
      isPaused={isPaused}
      onPause={handlePause}
      onContinue={handleContinue}
      rewindOptions={session.steps
        .filter((_, i) => i < session.currentStepIndex)
        .map((s, i) => ({ value: String(i), label: s.name }))}
      onEndSession={handleEndSession}
    />
  );
}

export function SessionRoute() {
  const { sessionId, workflowName: routeWorkflowName, workflowSteps } = useSessionRouteInfo();

  // Get workflow info from URL params (set by WorkspaceRoute)
  const workflowName = routeWorkflowName || "Plan & Execute";

  return (
    <SessionProvider sessionId={sessionId} workflowName={workflowName}>
      <SessionRunner workflowName={workflowName} />
      <SessionContent />
    </SessionProvider>
  );
}

// Orchestrates mock execution
function SessionRunner({ workflowName }: { workflowName: string }) {
  const session = useSessionContext();
  const runnerRef = useRef<MockSessionRunner | null>(null);
  const hasStarted = useRef(false);

  // Store callbacks in refs to avoid effect re-runs
  const callbacksRef = useRef(session);
  callbacksRef.current = session;

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Get scenario for this workflow
    const scenario = getScenario(workflowName) || planExecuteScenario;

    // Create and start runner - use ref for callbacks to avoid stale closures
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
        charDelayMs: 8, // Fast but visible typing
        toolCallDelayMs: 150,
        stepTransitionMs: 300,
        pauseCheckMs: 50,
      },
    });

    runnerRef.current = runner;

    // Start execution
    runner.start().catch((error) => {
      console.error("Session runner error:", error);
      callbacksRef.current.setError(error.message);
      callbacksRef.current.setStatus("error");
    });

    return () => {
      runner.stop();
    };
  }, [workflowName]); // Only depend on workflowName

  // Handle pause/resume from external state changes
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
