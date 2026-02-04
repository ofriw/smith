import { useCallback, useMemo } from "react";
import { useDB, useItem } from "@goatdb/goatdb/react";
import { kSchemaGlobalSettings } from "@smith/common";

export type Theme = "light" | "dark" | "system";
export type AccentColor = "blue" | "purple" | "teal" | "orange" | "pink" | "green";
export type DensityMode = "default" | "compact" | "comfortable";
export type RadiusScale = "default" | "sharp" | "round";
export type FontScale = "default" | "small" | "large";

export type GlobalSettings = {
  theme: Theme;
  accentColor: AccentColor;
  density: DensityMode;
  radius: RadiusScale;
  fontScale: FontScale;
  firstLaunchComplete: boolean;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
};

const SETTINGS_PATH = "/sys/settings/global";

export function useGlobalSettings() {
  const db = useDB();
  const item = useItem(SETTINGS_PATH);

  // Create item if it doesn't exist
  if (!item?.exists) {
    db.create(SETTINGS_PATH, kSchemaGlobalSettings, {});
  }

  const theme = (item?.get("theme") as Theme) ?? "system";
  const accentColor = (item?.get("accentColor") as AccentColor) ?? "blue";
  const density = (item?.get("density") as DensityMode) ?? "default";
  const radius = (item?.get("radius") as RadiusScale) ?? "default";
  const fontScale = (item?.get("fontScale") as FontScale) ?? "default";
  const firstLaunchComplete = (item?.get("firstLaunchComplete") as boolean) ?? false;
  const defaultModel = item?.get("defaultModel") as string | undefined;
  const maxTokens = item?.get("maxTokens") as number | undefined;
  const temperature = item?.get("temperature") as number | undefined;

  const setTheme = useCallback(
    (value: Theme) => {
      item?.set("theme", value);
    },
    [item]
  );

  const setAccentColor = useCallback(
    (value: AccentColor) => {
      item?.set("accentColor", value);
    },
    [item]
  );

  const setDensity = useCallback(
    (value: DensityMode) => {
      item?.set("density", value);
    },
    [item]
  );

  const setRadius = useCallback(
    (value: RadiusScale) => {
      item?.set("radius", value);
    },
    [item]
  );

  const setFontScale = useCallback(
    (value: FontScale) => {
      item?.set("fontScale", value);
    },
    [item]
  );

  const setFirstLaunchComplete = useCallback(
    (value: boolean) => {
      item?.set("firstLaunchComplete", value);
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

  const settings = useMemo<GlobalSettings>(
    () => ({
      theme,
      accentColor,
      density,
      radius,
      fontScale,
      firstLaunchComplete,
      defaultModel,
      maxTokens,
      temperature,
    }),
    [theme, accentColor, density, radius, fontScale, firstLaunchComplete, defaultModel, maxTokens, temperature]
  );

  return {
    ...settings,
    isLoading: !item?.exists,
    setTheme,
    setAccentColor,
    setDensity,
    setRadius,
    setFontScale,
    setFirstLaunchComplete,
    setDefaultModel,
    setMaxTokens,
    setTemperature,
  };
}
