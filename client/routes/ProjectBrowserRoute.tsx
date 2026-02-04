import React from "react";
import { useDB } from "@goatdb/goatdb/react";
import { kSchemaProjectSettings } from "@smith/common";
import { ProjectBrowserLayout } from "../components/layouts/index.ts";
import type { RecentProject } from "../components/layouts/index.ts";

export function ProjectBrowserRoute() {
  const db = useDB();

  // Demo data - in real app this would come from server/localStorage
  const recentProjects: RecentProject[] = [
    {
      id: "1",
      name: "smith",
      path: "/Users/ofri/Documents/GitHub/smith",
      branch: "main",
      onClick: () => {},
    },
    {
      id: "2",
      name: "another-project",
      path: "/Users/ofri/projects/another",
      branch: "feature/new",
      onClick: () => {},
    },
  ];

  const handleSelectProject = (projectId: string) => {
    // Store project metadata in GoatDB before navigating
    const project = recentProjects.find((p) => p.id === projectId);
    if (project) {
      const settingsPath = `/sys/settings/project/${projectId}`;
      const existing = db.item(settingsPath);
      if (!existing?.exists) {
        db.create(settingsPath, kSchemaProjectSettings, {
          projectId,
          name: project.name,
          path: project.path,
          branch: project.branch,
        });
      } else {
        existing.set("name", project.name);
        existing.set("path", project.path);
        existing.set("branch", project.branch);
      }
    }
    window.location.hash = `/project/${projectId}`;
  };

  const handleOpenFolder = () => {
    // In real app, this would open a file picker
    console.log("Open folder picker");
  };

  return (
    <ProjectBrowserLayout
      recentProjects={recentProjects}
      onSelectProject={handleSelectProject}
      onOpenFolder={handleOpenFolder}
    />
  );
}
