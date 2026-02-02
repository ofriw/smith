import React, { useState } from "react";
import { useProjectContext } from "../contexts/index.ts";
import { useSessionHistory, type HistoryEntry } from "../hooks/index.ts";
import { HistoryLayout } from "../components/layouts/index.ts";

function calculateTotalDuration(entries: HistoryEntry[]): string {
  let totalMinutes = 0;
  for (const entry of entries) {
    const match = entry.duration.match(/(\d+)m\s*(\d+)s/);
    if (match) {
      totalMinutes += parseInt(match[1], 10);
      totalMinutes += parseInt(match[2], 10) / 60;
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function HistoryRoute() {
  const { id: projectId, name } = useProjectContext();

  const [searchValue, setSearchValue] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const entries = useSessionHistory();

  // Filter entries based on search
  const filteredEntries = entries.filter((entry: HistoryEntry) => {
    if (!searchValue) return true;
    return entry.workflowName.toLowerCase().includes(searchValue.toLowerCase());
  });

  const projectOptions = [
    { value: "all", label: "All Projects" },
    { value: projectId, label: name || "Current Project" },
  ];

  const handleNewWorkflow = () => {
    window.location.hash = `/project/${projectId}`;
  };

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportName = `smith-history-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  };

  return (
    <HistoryLayout
      projectName={name || "Project"}
      entries={filteredEntries}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      projectOptions={projectOptions}
      selectedProject={selectedProject}
      onProjectChange={setSelectedProject}
      totalSessions={entries.length}
      totalDuration={calculateTotalDuration(entries)}
      onNewWorkflow={handleNewWorkflow}
      onExportHistory={handleExportHistory}
    />
  );
}
