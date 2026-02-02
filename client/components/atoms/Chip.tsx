import React from "react";

export type ChipProps = {
  children: React.ReactNode;
  variant?: "default" | "outline";
  icon?: React.ReactNode;
};

export function Chip({ children, variant = "default", icon }: ChipProps) {
  const className = ["chip", `chip--${variant}`].join(" ");

  return (
    <span className={className}>
      {icon && <span className="chip__icon">{icon}</span>}
      <span className="chip__content">{children}</span>
    </span>
  );
}
