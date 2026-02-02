import React, { useState, createContext, useContext } from "react";
import { ThemeProvider } from "./components/index.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { AppProvider, ProjectProvider } from "./contexts/index.ts";
import {
  ProjectBrowserRoute,
  WorkspaceRoute,
  SessionRoute,
  HistoryRoute,
  DevRoute,
} from "./routes/index.ts";

// Simple hash-based routing until wouter bundling issue is resolved
// See: https://github.com/molefrog/wouter/issues/469
type AppView =
  | { type: "home" }
  | { type: "dev" }
  | { type: "project"; projectId: string }
  | { type: "session"; projectId: string; sessionId: string; workflowName?: string; workflowSteps?: string[] }
  | { type: "history"; projectId: string };

// Context to pass session routing info
type SessionRouteInfo = {
  sessionId: string;
  workflowName?: string;
  workflowSteps?: string[];
};

const SessionRouteContext = createContext<SessionRouteInfo | null>(null);

export function useSessionRouteInfo(): SessionRouteInfo {
  const ctx = useContext(SessionRouteContext);
  if (!ctx) {
    throw new Error("useSessionRouteInfo must be used within SessionRoute");
  }
  return ctx;
}

function parseHash(): AppView {
  const fullHash = window.location.hash.slice(1);
  // Split hash into path and query string
  const [path, queryString] = fullHash.split("?");
  const params = new URLSearchParams(queryString || "");

  if (path === "/dev") return { type: "dev" };
  const projectMatch = path.match(/^\/project\/([^/]+)$/);
  if (projectMatch) return { type: "project", projectId: projectMatch[1] };
  const sessionMatch = path.match(/^\/project\/([^/]+)\/session\/([^/]+)$/);
  if (sessionMatch) {
    const workflowName = params.get("workflow") || undefined;
    const stepsParam = params.get("steps");
    const workflowSteps = stepsParam ? stepsParam.split(",") : undefined;
    return {
      type: "session",
      projectId: sessionMatch[1],
      sessionId: sessionMatch[2],
      workflowName,
      workflowSteps,
    };
  }
  const historyMatch = path.match(/^\/project\/([^/]+)\/history$/);
  if (historyMatch) return { type: "history", projectId: historyMatch[1] };
  return { type: "home" };
}

export function AppShell() {
  const [view, setView] = useState<AppView>(parseHash);

  // Listen for hash changes
  React.useEffect(() => {
    const handleHashChange = () => setView(parseHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <ThemeProvider>
      <AppProvider>
        <ErrorBoundary>
          {view.type === "dev" && <DevRoute />}
          {view.type === "home" && <ProjectBrowserRoute />}
          {view.type === "project" && (
            <ProjectProvider projectId={view.projectId}>
              <WorkspaceRoute />
            </ProjectProvider>
          )}
          {view.type === "session" && (
            <ProjectProvider projectId={view.projectId}>
              <SessionRouteContext.Provider value={{
                sessionId: view.sessionId,
                workflowName: view.workflowName,
                workflowSteps: view.workflowSteps,
              }}>
                <SessionRoute />
              </SessionRouteContext.Provider>
            </ProjectProvider>
          )}
          {view.type === "history" && (
            <ProjectProvider projectId={view.projectId}>
              <HistoryRoute />
            </ProjectProvider>
          )}
        </ErrorBoundary>
      </AppProvider>
    </ThemeProvider>
  );
}
