import React from "react";
import { cn } from "../../utils/index.ts";

export type ActivityBarItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

export function ActivityBarItem({
  icon,
  label,
  isActive = false,
  onClick,
}: ActivityBarItemProps) {
  return (
    <button
      className={cn("activity-bar-item", isActive && "activity-bar-item--active")}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
    >
      <span className="activity-bar-item__icon">{icon}</span>
    </button>
  );
}
