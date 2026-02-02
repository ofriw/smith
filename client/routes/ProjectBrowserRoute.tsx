import React from "react";
import { ProjectBrowserLayout } from "../components/layouts/index.ts";

export function ProjectBrowserRoute() {
  // Demo data - in real app this would come from server/localStorage
  const recentProjects = [
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
