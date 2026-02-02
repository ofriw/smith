import React from "react";
import { RadioGroup } from "../atoms/index.ts";

export type ExecutionMode = "confirm-all" | "steps-only" | "autonomous";

export type ExecutionModeToggleProps = {
  value: ExecutionMode;
  onChange: (value: ExecutionMode) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
  className?: string;
};

const modeOptions = [
  {
    value: "confirm-all" as ExecutionMode,
    label: "Confirm All",
    description: "Pause for approval before every tool call",
  },
  {
    value: "steps-only" as ExecutionMode,
    label: "Steps Only",
    description: "Pause only between workflow steps",
  },
  {
    value: "autonomous" as ExecutionMode,
    label: "Autonomous",
    description: "Run fully autonomous until completion",
  },
];

export function ExecutionModeToggle({
  value,
  onChange,
  disabled = false,
  showDescriptions = true,
  className = "",
}: ExecutionModeToggleProps) {
  const classNames = ["execution-mode-toggle", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <RadioGroup
        value={value}
        onChange={(val) => onChange(val as ExecutionMode)}
        options={modeOptions}
        name="execution-mode"
        variant="pill"
        disabled={disabled}
      />
      {showDescriptions && (
        <div className="execution-mode-toggle__descriptions">
          {modeOptions.map((opt) => (
            <div
              key={opt.value}
              className={[
                "execution-mode-toggle__description",
                value === opt.value && "execution-mode-toggle__description--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {opt.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
