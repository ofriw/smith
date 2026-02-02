import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useGlobalSettings } from "../hooks/useGlobalSettings.ts";

export type Settings = {
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
};

export type AppState = {
  isFirstLaunch: boolean;
  globalSettings: Settings;
  isLoading: boolean;
};

type AppContextValue = AppState & {
  setGlobalSettings: (settings: Settings) => void;
  markFirstLaunchComplete: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const {
    firstLaunchComplete,
    defaultModel,
    maxTokens,
    temperature,
    isLoading,
    setFirstLaunchComplete,
    setDefaultModel,
    setMaxTokens,
    setTemperature,
  } = useGlobalSettings();

  const globalSettings = useMemo<Settings>(
    () => ({ defaultModel, maxTokens, temperature }),
    [defaultModel, maxTokens, temperature]
  );

  const setGlobalSettings = useCallback(
    (settings: Settings) => {
      setDefaultModel(settings.defaultModel);
      setMaxTokens(settings.maxTokens);
      setTemperature(settings.temperature);
    },
    [setDefaultModel, setMaxTokens, setTemperature]
  );

  const markFirstLaunchComplete = useCallback(() => {
    setFirstLaunchComplete(true);
  }, [setFirstLaunchComplete]);

  const value = useMemo<AppContextValue>(
    () => ({
      isFirstLaunch: !firstLaunchComplete,
      globalSettings,
      isLoading,
      setGlobalSettings,
      markFirstLaunchComplete,
    }),
    [firstLaunchComplete, globalSettings, isLoading, setGlobalSettings, markFirstLaunchComplete]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
