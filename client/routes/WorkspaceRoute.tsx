import React, { useState } from "react";
import { useProjectContext } from "../contexts/index.ts";
import {
  WorkspaceLayout,
  EmptyStateContent,
} from "../components/layouts/index.ts";
import type { Tab, SidebarProject } from "../components/index.ts";

const navigate = (path: string) => {
  window.location.hash = path;
};

export function WorkspaceRoute() {
  const { id: projectId, name, path, branch } = useProjectContext();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Demo sidebar projects - in real app from context/server
  const sidebarProjects: SidebarProject[] = [
    {
      id: projectId,
      name: name || "Current Project",
      path: path || "/path/to/project",
      branch: branch || "main",
      onClick: () => {},
      hasRunningWorkflow: false,
    },
  ];

  const handleTabClose = (tabId: string) => {
    setTabs((current: Tab[]) => {
      const filtered = current.filter((t: Tab) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleNewTab = () => {
    const newId = crypto.randomUUID();
    const newTab: Tab = {
      id: newId,
      label: "New Workflow",
      status: "active",
    };
    setTabs((current: Tab[]) => [...current, newTab]);
    setActiveTabId(newId);
  };

  const handleWorkflowSelect = (workflowName: string, steps: string[]) => {
    const sessionId = crypto.randomUUID();
    // Pass workflow info via URL params (ephemeral, not persisted)
    const params = new URLSearchParams();
    params.set("workflow", workflowName);
    params.set("steps", steps.join(","));
    navigate(`/project/${projectId}/session/${sessionId}?${params.toString()}`);
  };

  // Demo workflow data
  const workflowGroups = [
    {
      title: "USER WORKFLOWS",
      path: "~/.smith/workflows/",
      workflows: [
        {
          name: "Plan & Execute",
          description: "Research, plan, then execute",
          steps: ["Research", "Plan", "Execute"],
          onClick: () => handleWorkflowSelect("Plan & Execute", ["Research", "Plan", "Execute"]),
        },
        {
          name: "Quick Fix",
          description: "Fast bug fixing workflow",
          steps: ["Analyze", "Fix"],
          onClick: () => handleWorkflowSelect("Quick Fix", ["Analyze", "Fix"]),
        },
      ],
    },
    {
      title: "PROJECT WORKFLOWS",
      path: ".smith/workflows/",
      workflows: [
        {
          name: "Custom Workflow",
          description: "Project-specific workflow",
          steps: ["Custom"],
          onClick: () => handleWorkflowSelect("Custom Workflow", ["Custom"]),
        },
      ],
    },
  ];

  const recentWorkflows = [
    { id: "1", name: "Plan & Execute", timestamp: "2 hours ago", onClick: () => handleWorkflowSelect("Plan & Execute", ["Research", "Plan", "Execute"]) },
    { id: "2", name: "Quick Fix", timestamp: "Yesterday", onClick: () => handleWorkflowSelect("Quick Fix", ["Analyze", "Fix"]) },
  ];

  // If no active tabs, show empty state
  if (tabs.length === 0 || activeTabId === null) {
    return (
      <WorkspaceLayout
        projects={sidebarProjects}
        activeProjectId={projectId}
        onProjectSelect={(id) => navigate(`/project/${id}`)}
        onOpenProject={() => navigate("/")}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        tabs={tabs}
        activeTabId={activeTabId || ""}
        onTabSelect={setActiveTabId}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      >
        <EmptyStateContent
          projectName={name || "Project"}
          branch={branch || "main"}
          projectPath={path || "/path/to/project"}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          workflowGroups={workflowGroups}
          recentWorkflows={recentWorkflows}
          onCreateWorkflow={() => {}}
        />
      </WorkspaceLayout>
    );
  }

  // Show workspace with active tab content
  return (
    <WorkspaceLayout
      projects={sidebarProjects}
      activeProjectId={projectId}
      onProjectSelect={(id) => navigate(`/project/${id}`)}
      onOpenProject={() => navigate("/")}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabSelect={setActiveTabId}
      onTabClose={handleTabClose}
      onNewTab={handleNewTab}
    >
      {/* TODO: Render active tab content here */}
      <div className="workspace-tab-content">
        <p>Tab content for: {activeTabId}</p>
      </div>
    </WorkspaceLayout>
  );
}
