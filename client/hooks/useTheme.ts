import { useState, useEffect, useCallback } from "react";
import {
  useGlobalSettings,
  type Theme,
  type AccentColor,
  type DensityMode,
  type RadiusScale,
  type FontScale,
} from "./useGlobalSettings.ts";

export type { Theme, AccentColor, DensityMode, RadiusScale, FontScale };
export type ResolvedTheme = "light" | "dark";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === "undefined") return;

  if (resolvedTheme === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function applyAccent(accent: AccentColor) {
  if (typeof document === "undefined") return;

  if (accent === "blue") {
    delete document.documentElement.dataset.themeAccent;
  } else {
    document.documentElement.dataset.themeAccent = accent;
  }
}

function applyDensity(density: DensityMode) {
  if (typeof document === "undefined") return;

  if (density === "default") {
    delete document.documentElement.dataset.density;
  } else {
    document.documentElement.dataset.density = density;
  }
}

function applyRadius(radius: RadiusScale) {
  if (typeof document === "undefined") return;

  if (radius === "default") {
    delete document.documentElement.dataset.radius;
  } else {
    document.documentElement.dataset.radius = radius;
  }
}

function applyFontScale(fontScale: FontScale) {
  if (typeof document === "undefined") return;

  if (fontScale === "default") {
    delete document.documentElement.dataset.fontScale;
  } else {
    document.documentElement.dataset.fontScale = fontScale;
  }
}

export function useTheme() {
  const {
    theme,
    setTheme: setThemeInDB,
    accentColor,
    setAccentColor: setAccentInDB,
    density,
    setDensity: setDensityInDB,
    radius,
    setRadius: setRadiusInDB,
    fontScale,
    setFontScale: setFontScaleInDB,
    isLoading,
  } = useGlobalSettings();
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme)
  );

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeInDB(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [setThemeInDB]);

  const setAccent = useCallback((color: AccentColor) => {
    setAccentInDB(color);
    applyAccent(color);
  }, [setAccentInDB]);

  const setDensity = useCallback((mode: DensityMode) => {
    setDensityInDB(mode);
    applyDensity(mode);
  }, [setDensityInDB]);

  const setRadius = useCallback((scale: RadiusScale) => {
    setRadiusInDB(scale);
    applyRadius(scale);
  }, [setRadiusInDB]);

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleInDB(scale);
    applyFontScale(scale);
  }, [setFontScaleInDB]);

  useEffect(() => {
    // Update resolved theme when theme changes
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme]);

  useEffect(() => {
    // Apply accent color on mount and when it changes
    applyAccent(accentColor);
  }, [accentColor]);

  useEffect(() => {
    // Apply density on mount and when it changes
    applyDensity(density);
  }, [density]);

  useEffect(() => {
    // Apply radius on mount and when it changes
    applyRadius(radius);
  }, [radius]);

  useEffect(() => {
    // Apply font scale on mount and when it changes
    applyFontScale(fontScale);
  }, [fontScale]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    accentColor,
    setAccent,
    density,
    setDensity,
    radius,
    setRadius,
    fontScale,
    setFontScale,
    isLoading,
  };
}
