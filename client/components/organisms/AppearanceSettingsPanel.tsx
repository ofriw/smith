import React from "react";
import { RadioGroup } from "../atoms/index.ts";
import { ColorSwatch } from "../atoms/ColorSwatch.tsx";
import {
  useTheme,
  type Theme,
  type AccentColor,
  type DensityMode,
  type RadiusScale,
  type FontScale,
} from "../../hooks/useTheme.ts";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const ACCENT_COLORS: { value: AccentColor; color: string; label: string }[] = [
  { value: "blue", color: "hsl(217 91% 54%)", label: "Blue" },
  { value: "purple", color: "hsl(270 91% 54%)", label: "Purple" },
  { value: "teal", color: "hsl(174 91% 40%)", label: "Teal" },
  { value: "orange", color: "hsl(25 91% 54%)", label: "Orange" },
  { value: "pink", color: "hsl(330 91% 54%)", label: "Pink" },
  { value: "green", color: "hsl(142 71% 45%)", label: "Green" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
];

const RADIUS_OPTIONS = [
  { value: "sharp", label: "Sharp" },
  { value: "default", label: "Default" },
  { value: "round", label: "Round" },
];

const FONT_SCALE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
];

export type AppearanceSettingsPanelProps = {
  className?: string;
};

export function AppearanceSettingsPanel({
  className = "",
}: AppearanceSettingsPanelProps) {
  const {
    theme,
    setTheme,
    accentColor,
    setAccent,
    density,
    setDensity,
    radius,
    setRadius,
    fontScale,
    setFontScale,
  } = useTheme();

  const classNames = ["appearance-settings-panel", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className="appearance-settings-panel__section">
        <h4 className="appearance-settings-panel__label">Theme</h4>
        <RadioGroup
          name="theme"
          value={theme}
          onChange={(value) => setTheme(value as Theme)}
          options={THEME_OPTIONS}
          variant="pill"
        />
      </div>

      <div className="appearance-settings-panel__section">
        <h4 className="appearance-settings-panel__label">Accent Color</h4>
        <div className="appearance-settings-panel__swatches">
          {ACCENT_COLORS.map(({ value, color, label }) => (
            <ColorSwatch
              key={value}
              color={color}
              selected={accentColor === value}
              onClick={() => setAccent(value)}
              label={label}
            />
          ))}
        </div>
      </div>

      <div className="appearance-settings-panel__section">
        <h4 className="appearance-settings-panel__label">Density</h4>
        <RadioGroup
          name="density"
          value={density}
          onChange={(value) => setDensity(value as DensityMode)}
          options={DENSITY_OPTIONS}
          variant="pill"
        />
      </div>

      <div className="appearance-settings-panel__section">
        <h4 className="appearance-settings-panel__label">Radius</h4>
        <RadioGroup
          name="radius"
          value={radius}
          onChange={(value) => setRadius(value as RadiusScale)}
          options={RADIUS_OPTIONS}
          variant="pill"
        />
      </div>

      <div className="appearance-settings-panel__section">
        <h4 className="appearance-settings-panel__label">Font Scale</h4>
        <RadioGroup
          name="fontScale"
          value={fontScale}
          onChange={(value) => setFontScale(value as FontScale)}
          options={FONT_SCALE_OPTIONS}
          variant="pill"
        />
      </div>
    </div>
  );
}
