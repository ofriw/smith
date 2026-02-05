import React, { useState, useCallback } from "react";
import { ActivityBarItem } from "../molecules/ActivityBarItem.tsx";
import { StatusBar } from "../organisms/StatusBar.tsx";
import type { SessionStatus } from "../organisms/StatusBar.tsx";
import { cn } from "../../utils/index.ts";

export type SidebarView = "outline" | "history" | "settings";

export type IDEShellProps = {
  projectName: string;
  branch?: string;
  path?: string;
  sessionStatus: SessionStatus;
  currentStep?: number;
  totalSteps?: number;
  workflowName?: string;
  onPause?: () => void;
  onContinue?: () => void;
  onEndSession?: () => void;
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
};

const OutlineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

export function IDEShell({
  projectName,
  branch,
  path,
  sessionStatus,
  currentStep,
  totalSteps,
  workflowName,
  onPause,
  onContinue,
  onEndSession,
  sidebarContent,
  children,
}: IDEShellProps) {
  const [activeView, setActiveView] = useState<SidebarView>("outline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleViewClick = useCallback((view: SidebarView) => {
    if (activeView === view && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    } else {
      setActiveView(view);
      setSidebarCollapsed(false);
    }
  }, [activeView, sidebarCollapsed]);

  const getSidebarTitle = () => {
    switch (activeView) {
      case "outline": return "OUTLINE";
      case "history": return "HISTORY";
      case "settings": return "SETTINGS";
    }
  };

  return (
    <div className={cn("ide-shell", sidebarCollapsed && "ide-shell--sidebar-collapsed")}>
      {/* Activity Bar */}
      <aside className="ide-shell__activity-bar">
        <div className="ide-shell__activity-bar-top">
          <ActivityBarItem
            icon={<OutlineIcon />}
            label="Outline"
            isActive={activeView === "outline" && !sidebarCollapsed}
            onClick={() => handleViewClick("outline")}
          />
          <ActivityBarItem
            icon={<HistoryIcon />}
            label="History"
            isActive={activeView === "history" && !sidebarCollapsed}
            onClick={() => handleViewClick("history")}
          />
        </div>
        <div className="ide-shell__activity-bar-bottom">
          <ActivityBarItem
            icon={<SettingsIcon />}
            label="Settings"
            isActive={activeView === "settings" && !sidebarCollapsed}
            onClick={() => handleViewClick("settings")}
          />
          <ActivityBarItem
            icon={<CollapseIcon />}
            label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </aside>

      {/* Sidebar */}
      <aside className="ide-shell__sidebar">
        <header className="ide-shell__sidebar-header">
          <h2 className="ide-shell__sidebar-title">{getSidebarTitle()}</h2>
        </header>
        <div className="ide-shell__sidebar-content">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ide-shell__main">
        <header className="ide-shell__main-header">
          <h1 className="ide-shell__main-title">{projectName}</h1>
          <div className="ide-shell__main-meta">
            {branch && <span className="ide-shell__main-branch">{branch}</span>}
            {path && <span className="ide-shell__main-path">{path}</span>}
          </div>
        </header>
        <div className="ide-shell__main-content">
          {children}
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        className="ide-shell__status-bar"
        sessionStatus={sessionStatus}
        currentStep={currentStep}
        totalSteps={totalSteps}
        workflowName={workflowName}
        onPause={onPause}
        onContinue={onContinue}
        onEndSession={onEndSession}
      />
    </div>
  );
}
