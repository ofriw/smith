import React, { useState } from "react";
import { ThemeProvider } from "./components/index.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { AppProvider, ProjectProvider } from "./contexts/index.ts";
import {
  ProjectBrowserRoute,
  WorkspaceRoute,
  DevRoute,
} from "./routes/index.ts";

// Simple hash-based routing until wouter bundling issue is resolved
// See: https://github.com/molefrog/wouter/issues/469
type AppView =
  | { type: "home" }
  | { type: "dev" }
  | { type: "project"; projectId: string };

function parseHash(): AppView {
  const fullHash = window.location.hash.slice(1);
  const [path] = fullHash.split("?");

  if (path === "/dev") return { type: "dev" };
  const projectMatch = path.match(/^\/project\/([^/]+)$/);
  if (projectMatch) return { type: "project", projectId: projectMatch[1] };
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
        </ErrorBoundary>
      </AppProvider>
    </ThemeProvider>
  );
}
