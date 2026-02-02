import { useCallback, useMemo } from "react";
import { useDB, useItem } from "@goatdb/goatdb/react";
import { kSchemaProjectSettings } from "@smith/common";
import { useGlobalSettings } from "./useGlobalSettings.ts";

export type ProjectSettings = {
  projectId: string;
  path?: string;
  name?: string;
  branch?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
};

export function useProjectSettings(projectId: string) {
  const db = useDB();
  const globalSettings = useGlobalSettings();
  const settingsPath = `/sys/settings/project/${projectId}`;
  const item = useItem(settingsPath);

  // Create item if it doesn't exist
  if (!item?.exists) {
    db.create(settingsPath, kSchemaProjectSettings, { projectId });
  }

  const path = item?.get("path") as string | undefined;
  const name = item?.get("name") as string | undefined;
  const branch = item?.get("branch") as string | undefined;
  const projectDefaultModel = item?.get("defaultModel") as string | undefined;
  const projectMaxTokens = item?.get("maxTokens") as number | undefined;
  const projectTemperature = item?.get("temperature") as number | undefined;

  // Merge with global settings (project overrides global)
  const mergedDefaultModel = projectDefaultModel ?? globalSettings.defaultModel;
  const mergedMaxTokens = projectMaxTokens ?? globalSettings.maxTokens;
  const mergedTemperature = projectTemperature ?? globalSettings.temperature;

  const setPath = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        item?.delete("path");
      } else {
        item?.set("path", value);
      }
    },
    [item]
  );

  const setName = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        item?.delete("name");
      } else {
        item?.set("name", value);
      }
    },
    [item]
  );

  const setBranch = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        item?.delete("branch");
      } else {
        item?.set("branch", value);
      }
    },
    [item]
  );

  const setDefaultModel = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        item?.delete("defaultModel");
      } else {
        item?.set("defaultModel", value);
      }
    },
    [item]
  );

  const setMaxTokens = useCallback(
    (value: number | undefined) => {
      if (value === undefined) {
        item?.delete("maxTokens");
      } else {
        item?.set("maxTokens", value);
      }
    },
    [item]
  );

  const setTemperature = useCallback(
    (value: number | undefined) => {
      if (value === undefined) {
        item?.delete("temperature");
      } else {
        item?.set("temperature", value);
      }
    },
    [item]
  );

  const settings = useMemo<ProjectSettings>(
    () => ({
      projectId,
      path,
      name,
      branch,
      defaultModel: mergedDefaultModel,
      maxTokens: mergedMaxTokens,
      temperature: mergedTemperature,
    }),
    [projectId, path, name, branch, mergedDefaultModel, mergedMaxTokens, mergedTemperature]
  );

  return {
    ...settings,
    isLoading: !item?.exists,
    setPath,
    setName,
    setBranch,
    setDefaultModel,
    setMaxTokens,
    setTemperature,
  };
}
