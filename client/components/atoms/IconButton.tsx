import React from "react";

export type IconType =
  | "close"
  | "add"
  | "settings"
  | "expand"
  | "collapse"
  | "revert"
  | "rewind";

export type IconButtonProps = {
  icon: IconType;
  onClick: (e?: React.MouseEvent) => void;
  variant?: "ghost" | "subtle";
  size?: "sm" | "md";
  disabled?: boolean;
  label: string;
};

const icons: Record<IconType, React.ReactNode> = {
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),
  revert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  rewind: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
    </svg>
  ),
};

export function IconButton({
  icon,
  onClick,
  variant = "ghost",
  size = "md",
  disabled = false,
  label,
}: IconButtonProps) {
  const className = [
    "icon-button",
    `icon-button--${variant}`,
    `icon-button--${size}`,
  ].join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <span className="icon-button__icon">{icons[icon]}</span>
    </button>
  );
}
