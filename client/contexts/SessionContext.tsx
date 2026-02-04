import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type ExecutionMode = "steps-only" | "continuous";

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
  stepName?: string;
  description?: string;
  input?: string;
  output?: string;
};

export type SessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

export type SessionState = {
  id: string;
  workflowName: string;
  status: SessionStatus;
  executionMode: ExecutionMode;
  steps: Step[];
  currentStepIndex: number;
  toolCalls: ToolCall[];
  streamingOutput: string;
  globalInputs: Record<string, unknown>;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
};

type SessionContextValue = SessionState & {
  setExecutionMode: (mode: ExecutionMode) => void;
  setStatus: (status: SessionStatus) => void;
  appendStreamingOutput: (text: string) => void;
  addToolCall: (call: ToolCall) => void;
  updateToolCall: (id: string, updates: Partial<ToolCall>) => void;
  setGlobalInputs: (data: Record<string, unknown>) => void;
  setInputData: (data: Record<string, unknown>) => void;
  setOutputData: (data: Record<string, unknown>) => void;
  setSteps: (steps: Step[]) => void;
  setCurrentStepIndex: (index: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  sessionId: string;
  workflowName?: string;
  globalInputs?: Record<string, unknown>;
  children: React.ReactNode;
};

const initialState: Omit<SessionState, "id" | "workflowName"> = {
  status: "idle",
  executionMode: "steps-only",
  steps: [],
  currentStepIndex: 0,
  toolCalls: [],
  streamingOutput: "",
  globalInputs: {},
  inputData: {},
  outputData: {},
  startedAt: null,
  completedAt: null,
  error: null,
};

export function SessionProvider({
  sessionId,
  workflowName = "Untitled Workflow",
  globalInputs: initialGlobalInputs = {},
  children,
}: SessionProviderProps) {
  const [state, setState] = useState<SessionState>({
    ...initialState,
    id: sessionId,
    workflowName,
    globalInputs: initialGlobalInputs,
  });

  const setExecutionMode = useCallback((mode: ExecutionMode) => {
    setState((s) => ({ ...s, executionMode: mode }));
  }, []);

  const setStatus = useCallback((status: SessionStatus) => {
    setState((s) => {
      const updates: Partial<SessionState> = { status };
      if (status === "running" && !s.startedAt) {
        updates.startedAt = new Date();
      }
      if ((status === "completed" || status === "error") && !s.completedAt) {
        updates.completedAt = new Date();
      }
      return { ...s, ...updates };
    });
  }, []);

  const appendStreamingOutput = useCallback((text: string) => {
    setState((s) => ({ ...s, streamingOutput: s.streamingOutput + text }));
  }, []);

  const addToolCall = useCallback((call: ToolCall) => {
    setState((s) => ({ ...s, toolCalls: [...s.toolCalls, call] }));
  }, []);

  const updateToolCall = useCallback(
    (id: string, updates: Partial<ToolCall>) => {
      setState((s) => ({
        ...s,
        toolCalls: s.toolCalls.map((tc) =>
          tc.id === id ? { ...tc, ...updates } : tc
        ),
      }));
    },
    [],
  );

  const setGlobalInputs = useCallback((data: Record<string, unknown>) => {
    setState((s) => ({ ...s, globalInputs: data }));
  }, []);

  const setInputData = useCallback((data: Record<string, unknown>) => {
    setState((s) => ({ ...s, inputData: data }));
  }, []);

  const setOutputData = useCallback((data: Record<string, unknown>) => {
    setState((s) => ({ ...s, outputData: data }));
  }, []);

  const setSteps = useCallback((steps: Step[]) => {
    setState((s) => ({ ...s, steps }));
  }, []);

  const setCurrentStepIndex = useCallback((index: number) => {
    setState((s) => ({ ...s, currentStepIndex: index }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({
      ...initialState,
      id: s.id,
      workflowName: s.workflowName,
    }));
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    ...state,
    setExecutionMode,
    setStatus,
    appendStreamingOutput,
    addToolCall,
    updateToolCall,
    setGlobalInputs,
    setInputData,
    setOutputData,
    setSteps,
    setCurrentStepIndex,
    setError,
    reset,
  }), [
    state,
    setExecutionMode,
    setStatus,
    appendStreamingOutput,
    addToolCall,
    updateToolCall,
    setGlobalInputs,
    setInputData,
    setOutputData,
    setSteps,
    setCurrentStepIndex,
    setError,
    reset,
  ]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
