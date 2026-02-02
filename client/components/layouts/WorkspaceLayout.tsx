import React from "react";
import { Sidebar, TabBar } from "../organisms/index.ts";
import type { SidebarProject, Tab } from "../organisms/index.ts";

export type WorkspaceLayoutProps = {
  projects: SidebarProject[];
  activeProjectId?: string;
  onProjectSelect: (id: string) => void;
  onOpenProject: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  children: React.ReactNode;
};

export function WorkspaceLayout({
  projects,
  activeProjectId,
  onProjectSelect,
  onOpenProject,
  sidebarCollapsed,
  onToggleSidebar,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  children,
}: WorkspaceLayoutProps) {
  const className = [
    "workspace-layout",
    sidebarCollapsed && "workspace-layout--sidebar-collapsed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <div className="workspace-layout__sidebar">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onProjectSelect={onProjectSelect}
          onOpenProject={onOpenProject}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
      </div>

      <div className="workspace-layout__main">
        <div className="workspace-layout__header">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={onTabSelect}
            onTabClose={onTabClose}
            onNewTab={onNewTab}
          />
        </div>

        <div className="workspace-layout__content">{children}</div>
      </div>
    </div>
  );
}
