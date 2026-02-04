import React, { useState } from "react";
import {
  useThemeContext,
  // Atoms
  StatusBadge,
  IconButton,
  Chip,
  ProgressDot,
  Button,
  TextInput,
  TextArea,
  Select,
  Toggle,
  RadioGroup,
  LoadingSpinner,
  // Molecules
  KeyValueRow,
  ToolCallEntry,
  ProjectCard,
  ProviderRow,
  FormField,
  SearchInput,
  VerificationItem,
  StepSection,
  // Organisms
  Modal,
  WelcomeModal,
  InitializeProjectModal,
  SettingsModal,
  ToolRow,
  MCPServerRow,
  ConfirmDialog,
  ExecutionControls,
  SchemaForm,
  WorkflowSelectionPanel,
} from "../components/index.ts";
import type { SchemaField } from "../components/organisms/SchemaForm.tsx";

function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
        Theme:
      </span>
      <select
        value={theme}
        onChange={(e) =>
          setTheme(e.target.value as "light" | "dark" | "system")
        }
        style={{
          padding: "4px 8px",
          background: "var(--interactive-bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--surface-border)",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

const navigate = (path: string) => {
  window.location.hash = path;
};

export function DevRoute() {
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [textValue, setTextValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [toggleValue, setToggleValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [searchValue, setSearchValue] = useState("");

  // Modal states
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [initModalOpen, setInitModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Schema form state
  const [schemaValues, setSchemaValues] = useState<Record<string, unknown>>({});
  const schemaFields: SchemaField[] = [
    { name: "task", label: "Task", type: "text", required: true },
    { name: "scope", label: "Scope", type: "string" },
  ];

  return (
    <div
      style={{ padding: "var(--space-6)", maxWidth: "1200px", margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-bold)",
            }}
          >
            SMITH UI Components
          </h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Back to App
          </Button>
        </div>
        <ThemeToggle />
      </div>

      {/* Atoms */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2
          style={{
            fontSize: "var(--text-xl)",
            marginBottom: "var(--space-4)",
            color: "var(--text-secondary)",
          }}
        >
          Atoms
        </h2>

        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Button
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              StatusBadge
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <StatusBadge status="available" />
              <StatusBadge status="running" />
              <StatusBadge status="done" />
              <StatusBadge status="error" />
              <StatusBadge status="pending" />
              <StatusBadge status="unavailable" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              IconButton
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <IconButton icon="close" label="Close" onClick={() => {}} />
              <IconButton icon="add" label="Add" onClick={() => {}} />
              <IconButton icon="settings" label="Settings" onClick={() => {}} />
              <IconButton icon="expand" label="Expand" onClick={() => {}} variant="subtle" />
              <IconButton icon="revert" label="Revert" onClick={() => {}} variant="subtle" />
              <IconButton icon="rewind" label="Rewind" onClick={() => {}} disabled />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              TextInput & TextArea
            </h3>
            <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: "400px" }}>
              <TextInput value={textValue} onChange={setTextValue} placeholder="Enter text..." />
              <TextInput value="" onChange={() => {}} placeholder="With error" error />
              <TextInput value="" onChange={() => {}} placeholder="Disabled" disabled />
              <TextArea value={textAreaValue} onChange={setTextAreaValue} placeholder="Enter longer text..." rows={3} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Select
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <Select
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                  { value: "option3", label: "Option 3" },
                ]}
                placeholder="Select option..."
              />
              <Select
                value=""
                onChange={() => {}}
                options={[
                  { value: "gpt4", label: "GPT-4" },
                  { value: "claude", label: "Claude 3" },
                  { value: "gemini", label: "Gemini Pro" },
                ]}
                placeholder="Searchable..."
                searchable
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Toggle & RadioGroup
            </h3>
            <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", flexWrap: "wrap" }}>
              <Toggle checked={toggleValue} onChange={setToggleValue} label="Enable feature" />
              <RadioGroup
                value={radioValue}
                onChange={setRadioValue}
                name="demo-radio"
                variant="pill"
                options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                  { value: "option3", label: "Option 3" },
                ]}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              LoadingSpinner & Chip & ProgressDot
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <span style={{ marginLeft: "var(--space-2)" }} />
              <Chip>main</Chip>
              <Chip variant="outline">feature/new</Chip>
              <span style={{ marginLeft: "var(--space-2)" }} />
              <ProgressDot state="pending" />
              <ProgressDot state="active" />
              <ProgressDot state="completed" />
              <ProgressDot state="error" />
            </div>
          </div>
        </div>
      </section>

      {/* Molecules */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)", color: "var(--text-secondary)" }}>
          Molecules
        </h2>

        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              KeyValueRow
            </h3>
            <div style={{ background: "var(--surface-elevated)", padding: "var(--space-3)", borderRadius: "var(--radius-md)" }}>
              <KeyValueRow label="Model" value="gpt-4-turbo" />
              <KeyValueRow label="Status" value={<StatusBadge status="running" size="sm" />} />
              <KeyValueRow label="Long Value" value="This is a very long value that should be truncated when displayed" truncate />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              ToolCallEntry
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <ToolCallEntry toolName="file_read" status="done" description="Reading the configuration file" input='{ "path": "/config.json" }' onRevert={() => {}} />
              <ToolCallEntry toolName="llm_query" status="running" description="Querying the language model" />
              <ToolCallEntry toolName="file_write" status="error" description="Failed to write output" reverted />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              StepSection
            </h3>
            <div style={{ maxWidth: "600px" }}>
              <StepSection title="Input" defaultExpanded={false}>
                <pre>{"{ \"query\": \"example\" }"}</pre>
              </StepSection>
              <StepSection title="Tool Calls" count={3} defaultExpanded={true}>
                <p>Tool call content here</p>
              </StepSection>
              <StepSection title="Output" defaultExpanded={true}>
                <pre>{"{ \"result\": \"success\" }"}</pre>
              </StepSection>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              ProjectCard
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "var(--space-2)" }}>
              <ProjectCard name="smith" path="/Users/ofri/Documents/GitHub/smith" branch="main" onClick={() => {}} active />
              <ProjectCard name="another-project" path="/Users/ofri/projects/another-project" branch="feature/new-feature" onClick={() => {}} />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              ProviderRow
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <ProviderRow name="OpenAI" adapter="openai-compatible" status="available" models={["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]} builtin />
              <ProviderRow name="Anthropic" adapter="anthropic" status="unavailable" models={["claude-3-opus", "claude-3-sonnet"]} hint="Missing API key" />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              FormField & SearchInput
            </h3>
            <div style={{ maxWidth: "400px", display: "grid", gap: "var(--space-3)" }}>
              <FormField label="Username" required>
                <TextInput value={textValue} onChange={setTextValue} placeholder="Enter username" />
              </FormField>
              <FormField label="Description" hint="Optional field">
                <TextArea value={textAreaValue} onChange={setTextAreaValue} placeholder="Enter description" rows={2} />
              </FormField>
              <FormField label="Email" error="Invalid email format" required>
                <TextInput value="" onChange={() => {}} placeholder="Enter email" error />
              </FormField>
              <SearchInput value={searchValue} onChange={setSearchValue} placeholder="Search workflows..." />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              VerificationItem
            </h3>
            <div style={{ maxWidth: "400px", display: "grid", gap: "var(--space-2)" }}>
              <VerificationItem label="TypeScript" status="pass" />
              <VerificationItem label="ESLint" status="pass" />
              <VerificationItem label="Tests" status="fail" details="1 test failed: AuthService.test.ts" />
            </div>
          </div>
        </div>
      </section>

      {/* Organisms */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)", color: "var(--text-secondary)" }}>
          Organisms
        </h2>

        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              SchemaForm
            </h3>
            <div style={{ maxWidth: "400px" }}>
              <SchemaForm
                schema={schemaFields}
                values={schemaValues}
                onChange={(name, value) => setSchemaValues((prev) => ({ ...prev, [name]: value }))}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              ExecutionControls
            </h3>
            <ExecutionControls
              isRunning={true}
              isPaused={false}
              onPause={() => {}}
              onContinue={() => {}}
              rewindOptions={[
                { value: "0", label: "Research" },
                { value: "1", label: "Plan" },
              ]}
              onRewind={() => {}}
              onEndSession={() => {}}
            />
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Modal & ConfirmDialog
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
              <Button variant="danger" onClick={() => setConfirmDialogOpen(true)}>Open Confirm</Button>
            </div>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Example Modal"
              actions={
                <>
                  <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p>This is a modal dialog with focus trap and escape key handling.</p>
            </Modal>
            <ConfirmDialog
              open={confirmDialogOpen}
              onClose={() => setConfirmDialogOpen(false)}
              onConfirm={() => setConfirmDialogOpen(false)}
              title="End Session?"
              message="Are you sure you want to end this session? All unsaved progress will be lost."
              warning="This action cannot be undone."
              variant="danger"
            />
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Special Modals
            </h3>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => setWelcomeModalOpen(true)}>Welcome Modal</Button>
              <Button variant="secondary" onClick={() => setInitModalOpen(true)}>Initialize Modal</Button>
              <Button variant="secondary" onClick={() => setSettingsModalOpen(true)}>Settings Modal</Button>
              <Button variant="secondary" onClick={() => setShowWorkflowPanel(!showWorkflowPanel)}>
                {showWorkflowPanel ? "Hide" : "Show"} Workflow Panel
              </Button>
            </div>
            {welcomeModalOpen && (
              <WelcomeModal
                providers={[
                  { name: "OpenAI", adapter: "openai", status: "available", models: ["gpt-4", "gpt-3.5-turbo"], builtin: true },
                  { name: "Anthropic", adapter: "anthropic", status: "unavailable", models: [], hint: "Missing API key" },
                ]}
                modelOptions={[
                  { value: "openai:gpt-4", label: "OpenAI: GPT-4" },
                  { value: "openai:gpt-3.5-turbo", label: "OpenAI: GPT-3.5 Turbo" },
                ]}
                selectedModel=""
                onModelChange={() => {}}
                onGetStarted={() => setWelcomeModalOpen(false)}
              />
            )}
            <InitializeProjectModal
              open={initModalOpen}
              projectPath="/Users/ofri/Documents/GitHub/smith"
              onCancel={() => setInitModalOpen(false)}
              onInitialize={() => setInitModalOpen(false)}
            />
            <SettingsModal
              open={settingsModalOpen}
              onClose={() => setSettingsModalOpen(false)}
              providers={[{ name: "OpenAI", adapter: "openai", status: "available", models: ["gpt-4"], builtin: true }]}
              tools={[
                { name: "file_read", packageName: "@smith/tools", enabled: true, description: "Read file contents" },
                { name: "file_write", packageName: "@smith/tools", enabled: true },
              ]}
              onToolToggle={() => {}}
              modelOptions={[{ value: "openai:gpt-4", label: "GPT-4" }]}
              selectedModel="openai:gpt-4"
              onModelChange={() => {}}
              maxTokens={4096}
              onMaxTokensChange={() => {}}
              temperature={0.7}
              onTemperatureChange={() => {}}
              mcpServers={[{ name: "default", status: "running" }]}
              globalConfigPath="~/.smith/config.json"
              projectConfigPath=".smith/settings.json"
            />
            {showWorkflowPanel && (
              <div style={{ marginTop: "var(--space-4)", maxWidth: "480px" }}>
                <WorkflowSelectionPanel
                  projectName="smith"
                  workflowGroups={[
                    {
                      title: "User Workflows",
                      workflows: [
                        { id: "1", name: "Plan & Execute", description: "Research, plan, execute", stepCount: 3 },
                      ],
                    },
                  ]}
                  selectedWorkflowId="1"
                  onWorkflowSelect={() => {}}
                  inputSchema={schemaFields}
                  inputValues={schemaValues}
                  onInputChange={(name, value) => setSchemaValues((prev) => ({ ...prev, [name]: value }))}
                  onStartWorkflow={() => setShowWorkflowPanel(false)}
                />
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              ToolRow & MCPServerRow
            </h3>
            <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: "500px" }}>
              <ToolRow name="file_read" packageName="@smith/tools" enabled={true} onToggle={() => {}} description="Read contents of a file" />
              <ToolRow name="file_write" packageName="@smith/tools" enabled={false} onToggle={() => {}} />
              <MCPServerRow name="default" status="running" config={{ port: "3000", host: "localhost" }} />
              <MCPServerRow name="external" status="stopped" />
            </div>
          </div>
        </div>
      </section>

      {/* Layouts */}
      <section>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)", color: "var(--text-secondary)" }}>
          Layouts
        </h2>

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/")}>ProjectBrowser</Button>
          <Button onClick={() => navigate("/project/demo")}>Workspace</Button>
          <Button onClick={() => navigate("/project/demo/session/demo")}>Pipeline Session</Button>
        </div>
      </section>
    </div>
  );
}
