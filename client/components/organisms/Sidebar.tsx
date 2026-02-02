import React from "react";
import { IconButton } from "../atoms/index.ts";
import { ProjectCard } from "../molecules/index.ts";
import type { ProjectCardProps } from "../molecules/index.ts";

export type SidebarProject = ProjectCardProps & {
  id: string;
  hasRunningWorkflow?: boolean;
  hasError?: boolean;
};

export type SidebarProps = {
  projects: SidebarProject[];
  activeProjectId?: string;
  onProjectSelect: (id: string) => void;
  onOpenProject: () => void;
  collapsed?: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  onOpenProject,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const className = ["sidebar", collapsed && "sidebar--collapsed"]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={className}>
      <div className="sidebar__header">
        <span className="sidebar__title">Projects</span>
        <IconButton
          icon={collapsed ? "expand" : "collapse"}
          variant="ghost"
          size="sm"
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleCollapse}
        />
      </div>

      <div className="sidebar__content">
        <div className="sidebar__projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              path={project.path}
              branch={project.branch}
              active={project.id === activeProjectId}
              onClick={() => onProjectSelect(project.id)}
            />
          ))}
        </div>

        <div className="sidebar__collapsed-indicators">
          {projects.map((project) => (
            <button
              key={project.id}
              className={[
                "sidebar__collapsed-dot",
                project.id === activeProjectId && "sidebar__collapsed-dot--active",
                project.hasRunningWorkflow && "sidebar__collapsed-dot--running",
                project.hasError && "sidebar__collapsed-dot--error",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onProjectSelect(project.id)}
              title={project.name}
              aria-label={`Select ${project.name}`}
            />
          ))}
        </div>
      </div>

      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__open-btn"
          onClick={onOpenProject}
        >
          <span>+</span>
          <span className="sidebar__open-btn-text">Open Folder</span>
        </button>
      </div>
    </aside>
  );
}
