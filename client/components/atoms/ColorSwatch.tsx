import React from "react";

export type ColorSwatchProps = {
  color: string;
  selected: boolean;
  onClick: () => void;
  label?: string;
};

export function ColorSwatch({
  color,
  selected,
  onClick,
  label,
}: ColorSwatchProps) {
  const classNames = [
    "color-swatch",
    selected && "color-swatch--selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      aria-label={label || `Select ${color} color`}
      aria-pressed={selected}
      style={{ "--swatch-color": color } as React.CSSProperties}
    >
      {selected && (
        <svg
          className="color-swatch__check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          width="14"
          height="14"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </button>
  );
}
