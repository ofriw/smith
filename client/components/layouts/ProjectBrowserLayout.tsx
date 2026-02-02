import React from "react";
import { ProjectCard } from "../molecules/index.ts";
import type { ProjectCardProps } from "../molecules/index.ts";

export type RecentProject = ProjectCardProps & {
  id: string;
};

export type ProjectBrowserLayoutProps = {
  recentProjects?: RecentProject[];
  onOpenFolder: () => void;
  onSelectProject: (id: string) => void;
};

export function ProjectBrowserLayout({
  recentProjects = [],
  onOpenFolder,
  onSelectProject,
}: ProjectBrowserLayoutProps) {
  return (
    <div className="project-browser-layout">
      <div className="project-browser-layout__card">
        <h1 className="project-browser-layout__logo">S.M.I.T.H</h1>
        <p className="project-browser-layout__tagline">
          Structured Multi-model Intelligent Task Handler
        </p>

        <div className="project-browser-layout__action">
          <button
            type="button"
            className="project-browser-layout__open-btn"
            onClick={onOpenFolder}
          >
            <span>+</span>
            <span>Open Folder</span>
          </button>
        </div>

        {recentProjects.length > 0 && (
          <>
            <div className="project-browser-layout__divider">
              <span className="project-browser-layout__divider-line" />
              <span className="project-browser-layout__divider-text">or</span>
              <span className="project-browser-layout__divider-line" />
            </div>

            <div className="project-browser-layout__recent">
              <h2 className="project-browser-layout__recent-title">
                Recent Projects
              </h2>
              <div className="project-browser-layout__recent-list">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    name={project.name}
                    path={project.path}
                    branch={project.branch}
                    onClick={() => onSelectProject(project.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
