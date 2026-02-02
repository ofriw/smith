import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type { Settings } from "./AppContext.tsx";
import { useProjectSettings } from "../hooks/useProjectSettings.ts";

export type SyncStatus = "connecting" | "synced" | "error";

export type ProjectState = {
  id: string;
  path: string;
  name: string;
  branch: string | null;
  settings: Settings;
  syncStatus: SyncStatus;
};

type ProjectContextValue = ProjectState & {
  setProjectSettings: (settings: Partial<Settings>) => void;
  setSyncStatus: (status: SyncStatus) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

type ProjectProviderProps = {
  projectId: string;
  children: React.ReactNode;
};

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const {
    path,
    name,
    branch,
    defaultModel,
    maxTokens,
    temperature,
    setDefaultModel,
    setMaxTokens,
    setTemperature,
  } = useProjectSettings(projectId);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("connecting");

  useEffect(() => {
    // Simulate sync connection
    const timer = setTimeout(() => {
      setSyncStatus("synced");
    }, 500);

    return () => clearTimeout(timer);
  }, [projectId]);

  const mergedSettings = useMemo<Settings>(
    () => ({
      defaultModel,
      maxTokens,
      temperature,
    }),
    [defaultModel, maxTokens, temperature]
  );

  const setProjectSettings = useCallback(
    (settings: Partial<Settings>) => {
      if (settings.defaultModel !== undefined) {
        setDefaultModel(settings.defaultModel);
      }
      if (settings.maxTokens !== undefined) {
        setMaxTokens(settings.maxTokens);
      }
      if (settings.temperature !== undefined) {
        setTemperature(settings.temperature);
      }
    },
    [setDefaultModel, setMaxTokens, setTemperature]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      id: projectId,
      path: path || "",
      name: name || projectId,
      branch: branch || null,
      settings: mergedSettings,
      syncStatus,
      setProjectSettings,
      setSyncStatus,
    }),
    [projectId, path, name, branch, mergedSettings, syncStatus, setProjectSettings]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}
