import React, { useState } from "react";
import { Button, Select, SelectOption, TextInput, Toggle, IconButton } from "../atoms/index.ts";
import { ProviderRow, ProviderRowProps, SearchInput } from "../molecules/index.ts";
import { Modal } from "./Modal.tsx";
import { ToolRow, ToolRowProps } from "./ToolRow.tsx";
import { MCPServerRow, MCPServerRowProps } from "./MCPServerRow.tsx";
import { AppearanceSettingsPanel } from "./AppearanceSettingsPanel.tsx";

export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  providers: ProviderRowProps[];
  tools: Omit<ToolRowProps, "onToggle">[];
  onToolToggle: (name: string, enabled: boolean) => void;
  modelOptions: SelectOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  mcpServers: MCPServerRowProps[];
  globalConfigPath: string;
  projectConfigPath?: string;
};

export function SettingsModal({
  open,
  onClose,
  providers,
  tools,
  onToolToggle,
  modelOptions,
  selectedModel,
  onModelChange,
  maxTokens,
  onMaxTokensChange,
  temperature,
  onTemperatureChange,
  mcpServers,
  globalConfigPath,
  projectConfigPath,
}: SettingsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    providers: false,
    tools: false,
    mcpServers: false,
    advanced: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredProviders = providers.filter(p => matchesSearch(p.name));
  const filteredTools = tools.filter(t => matchesSearch(t.name));
  const filteredMcpServers = mcpServers.filter(s => matchesSearch(s.name));

  return (
    <Modal open={open} onClose={onClose} title="Settings" size="lg">
      <div className="settings-modal">
        <div className="settings-modal__search">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search settings..."
          />
        </div>

        {/* Appearance Section */}
        <section className="settings-modal__section">
          <button
            className="settings-modal__section-toggle"
            onClick={() => toggleSection('appearance')}
            aria-expanded={expandedSections.appearance}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`settings-modal__section-chevron ${expandedSections.appearance ? 'settings-modal__section-chevron--expanded' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <h3 className="settings-modal__section-title">Appearance</h3>
          </button>
          {expandedSections.appearance && (
            <div className="settings-modal__section-content">
              <AppearanceSettingsPanel />
            </div>
          )}
        </section>

        {/* Providers Section */}
        <section className="settings-modal__section">
          <button
            className="settings-modal__section-toggle"
            onClick={() => toggleSection('providers')}
            aria-expanded={expandedSections.providers}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`settings-modal__section-chevron ${expandedSections.providers ? 'settings-modal__section-chevron--expanded' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <h3 className="settings-modal__section-title">Providers</h3>
            <span className="settings-modal__section-count">({filteredProviders.length})</span>
          </button>
          {expandedSections.providers && (
            <div className="settings-modal__section-content">
              {filteredProviders.map((provider) => (
                <ProviderRow key={provider.name} {...provider} />
              ))}
            </div>
          )}
        </section>

        {/* Tools Section */}
        <section className="settings-modal__section">
          <button
            className="settings-modal__section-toggle"
            onClick={() => toggleSection('tools')}
            aria-expanded={expandedSections.tools}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`settings-modal__section-chevron ${expandedSections.tools ? 'settings-modal__section-chevron--expanded' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <h3 className="settings-modal__section-title">Tools</h3>
            <span className="settings-modal__section-count">({filteredTools.length})</span>
          </button>
          {expandedSections.tools && (
            <div className="settings-modal__section-content">
              {filteredTools.map((tool) => (
                <ToolRow
                  key={tool.name}
                  {...tool}
                  onToggle={(enabled) => onToolToggle(tool.name, enabled)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Default Model Section */}
        <section className="settings-modal__section">
          <h3 className="settings-modal__section-title">Default Model</h3>
          <div className="settings-modal__section-content">
            <Select
              value={selectedModel}
              onChange={onModelChange}
              options={modelOptions}
              placeholder="Select a model..."
              searchable
            />
          </div>
        </section>

        {/* Advanced Options Section */}
        <section className="settings-modal__section">
          <button
            className="settings-modal__section-toggle"
            onClick={() => toggleSection('advanced')}
            aria-expanded={expandedSections.advanced}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`settings-modal__section-chevron ${expandedSections.advanced ? 'settings-modal__section-chevron--expanded' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <h3 className="settings-modal__section-title">Advanced Options</h3>
          </button>
          {expandedSections.advanced && (
            <div className="settings-modal__section-content">
              <div className="settings-modal__field">
                <label className="settings-modal__field-label">Max Tokens</label>
                <TextInput
                  value={String(maxTokens)}
                  onChange={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) onMaxTokensChange(num);
                  }}
                  type="text"
                />
              </div>
              <div className="settings-modal__field">
                <label className="settings-modal__field-label">Temperature</label>
                <TextInput
                  value={String(temperature)}
                  onChange={(val) => {
                    const num = parseFloat(val);
                    if (!isNaN(num)) onTemperatureChange(num);
                  }}
                  type="text"
                />
              </div>
            </div>
          )}
        </section>

        {/* MCP Servers Section */}
        <section className="settings-modal__section">
          <button
            className="settings-modal__section-toggle"
            onClick={() => toggleSection('mcpServers')}
            aria-expanded={expandedSections.mcpServers}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`settings-modal__section-chevron ${expandedSections.mcpServers ? 'settings-modal__section-chevron--expanded' : ''}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <h3 className="settings-modal__section-title">MCP Servers</h3>
            <span className="settings-modal__section-count">({filteredMcpServers.length})</span>
          </button>
          {expandedSections.mcpServers && (
            <div className="settings-modal__section-content">
              {filteredMcpServers.length === 0 ? (
                <p className="settings-modal__empty">No MCP servers configured</p>
              ) : (
                filteredMcpServers.map((server) => (
                  <MCPServerRow key={server.name} {...server} />
                ))
              )}
            </div>
          )}
        </section>

        {/* Config Paths Footer */}
        <footer className="settings-modal__footer">
          <div className="settings-modal__config-path">
            <span className="settings-modal__config-label">Global config:</span>
            <code className="settings-modal__config-value">{globalConfigPath}</code>
          </div>
          {projectConfigPath && (
            <div className="settings-modal__config-path">
              <span className="settings-modal__config-label">Project config:</span>
              <code className="settings-modal__config-value">{projectConfigPath}</code>
            </div>
          )}
        </footer>
      </div>
    </Modal>
  );
}
