import React from "react";
import { Chip } from "../atoms/index.ts";

export type ProjectCardProps = {
  name: string;
  path: string;
  branch?: string;
  onClick: () => void;
  active?: boolean;
};

function shortenPath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) return path;

  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const first = parts[0];
  const last = parts[parts.length - 1];

  if (first.length + last.length + 5 > maxLength) {
    return `.../${last}`;
  }

  return `${first}/.../${last}`;
}

export function ProjectCard({
  name,
  path,
  branch,
  onClick,
  active = false,
}: ProjectCardProps) {
  const className = ["project-card", active && "project-card--active"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className="project-card__name">{name}</span>
      <div className="project-card__meta">
        <span className="project-card__path" title={path}>
          {shortenPath(path)}
        </span>
        {branch && <Chip variant="outline">{branch}</Chip>}
      </div>
    </div>
  );
}
