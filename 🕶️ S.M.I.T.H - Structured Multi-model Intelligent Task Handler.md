# 🕶️ S.M.I.T.H - Structured Multi-model Intelligent Task Handler

S.M.I.T.H is a new AI coding agent based on the concept of structured pipeline workflows instead of freeform autonomous agents with tools.
- **No free-prompt steering.** Users do not guide agents via chat. Instead, they inspect and edit step inputs/outputs directly, then rerun from that point. All user influence flows through structured data, not conversational nudges.
- Users define custom pipelines in code, exposing plugins to the agent similar to how gradle and other modern build systems work
- The agent provides a standard library that plugins can use. Including:
	- Serial and concurrent pipeline execution (for nesting and compositing)
	- Logging, monitoring, traceability and hooks
- Supports MCP and is LLM provider agnostic
- Tools are plugins implementing a standard `Tool` interface — analogous to the LLM adapter pattern. Core tools (read, write, glob, grep, bash) ship bundled; users can install additional tool packages without upgrading S.M.I.T.H. ExecutePipeline (sub-agent orchestration) is a core S.M.I.T.H runtime capability, not a pluggable tool.
- A self contained GoatDB (https://goatdb.dev) binary that exposes a web interface thus combining the deploy-everywhere capabilities of CLI agents while providing modern UI that developers appreciate
- This modeling was designed to enable:
	- Efficient, exact, context engineering with optimizing the LLM choice per pipeline step
	- Combine the effectiveness of CLI agents with the DX and ease of use of modern UI agents

## Project Model

S.M.I.T.H uses an explicit **open/closed project model**. A project can only be opened if it has a valid `.smith/` directory — folders must be initialized before they can be added to the workspace.

### Project States

| State | In Sidebar | GoatDB Active | .smith/ Valid |
|-------|------------|---------------|---------------|
| Uninitialized | No | No | No |
| Closed | No | No | Yes (can be reopened) |
| Open | Yes | Yes | Yes |

- **Opening a project** = adding to sidebar + activating GoatDB sync
- **Closing a project** = removing from sidebar + deactivating GoatDB sync
- **Recent list** shows all previously initialized projects (not arbitrary folders)

### Directory Structure (After Initialization)

```
my-project/
├── .smith/
│   ├── settings.json            # Project-level settings (tracked)
│   ├── settings.local.json      # Personal overrides (gitignored)
│   ├── workflows/               # Custom workflows (tracked)
│   │   ├── plan-execute/
│   │   │   └── smith.ts
│   │   └── fix-bug/
│   │       └── smith.ts
│   └── db/                      # GoatDB data (gitignored)
│       ├── registry/            # Session registry repo (always active)
│       └── sessions/            # Session repos (one per workflow execution)
├── src/
└── ...
```

### Initialization Flow

When a user selects a folder without `.smith/`:
1. **Initialize prompt appears** — "This folder needs S.M.I.T.H initialization to be opened"
2. **On Initialize**: Creates `.smith/` structure, appends gitignore rules
3. **Project opens** — added to sidebar, GoatDB sync activated, workspace loads

The recent list shows only previously initialized projects, providing quick access to known workspaces.

#### Git Tracking Rules

| Path | Git Status | Purpose |
|------|-----------|---------|
| `.smith/settings.json` | **Tracked** | Team-shared project config |
| `.smith/settings.local.json` | **Ignored** | Personal per-project overrides |
| `.smith/workflows/` | **Tracked** | Team-shared workflow definitions |
| `.smith/db/` | **Ignored** | Local GoatDB runtime data |

Initialization auto-appends `.smith/db/` and `.smith/settings.local.json` to the project's `.gitignore` (creates the file if it doesn't exist, only appends missing entries). `.smith/settings.local.json` itself is not created during init — only the ignore rule is added so the path is pre-protected when the user later creates it.

- **Initialization Required**: A folder must have valid `.smith/` to be opened as a project
- **Workflow Scoping**: Available workflows come from `~/.smith/workflows/` + `.smith/workflows/`
- **Context Inheritance**: File browser, terminal, git status all derive from project root

### Global vs Project Workflows

Workflows exist at two levels:
- `~/.smith/workflows/` - User-level templates (shared across all projects)
- `.smith/workflows/` - Project-specific workflows (override globals with same name)

When listing available workflows, project workflows take precedence over user-level templates.

Example built in pipelines:

**Plan>Execute**: Create a plan (readonly agent, no editing capabilities), break it to serial and parallel sub tasks, execute each task in its own context (with edit capabilities).

**Web Research**: LLM Query decomposition + Google search > Concurrent web fetch > synthesize response

## Main Flows

### Open Project
First screen on launch (no project open):
- Open Folder button (native file picker)
- Recent Projects list (name, path, git branch) — shows only initialized projects

Opening requires valid `.smith/` — folders without it trigger the initialization prompt.

### Main Screen
Workspace layout with **Project Sidebar** + **Workflow Tabs**:

**Project Sidebar** (left, collapsible):
- List of **open** projects (initialized + GoatDB active)
- Each project shows: name, branch, running workflow indicator
- Click to switch projects (loads that project's workflow tabs)
- [+ Open] button to open another project
- Closing a project removes it from sidebar, deactivates GoatDB sync

**Workflow Tabs** (top of main area):
- Tabs for workflows in the ACTIVE project only
- Each tab shows workflow name and status
- [+] button to start new workflow in current project

**Tab Content**:
- Workflow I/O panel (global inputs, step inputs/outputs — all editable when paused)
- File browser (rooted at project)
- Embedded terminal (cwd = project root)
- Status indicators:
	- Current project path
	- Git branch
	- Pipeline phase + step name
	- Tokens spent in current step + total
	- Running times of current step + total
	- Current LLM used for this step
	- Execution mode indicator (Confirm All / Steps Only / YOLO)
- Actions:
	- Choose workflow and provide global inputs
	- Edit step inputs/outputs when paused (creates forked session if editing completed steps)
	- Play/Pause/Rewind/Revert on current workflow
	- Switch to different project via sidebar

## Session Model

GoatDB serves as S.M.I.T.H's **working memory** — a local, append-only database that records every file-modifying action during workflow execution. Sessions are complementary to Git: Git tracks intentional project history (commits); GoatDB tracks granular operational history (tool calls) enabling selective rollback of any edit at any time.

### What is a Session

A **session** is a single workflow execution from start to finish. It is NOT a tab, a project, a workflow definition, or a retry — it maps 1:1 to one run of a workflow.

A session contains:
- Workflow type and inputs
- Ordered tool calls (the timeline)
- Phase transitions (Research → Plan → Execute)
- Approval decisions
- Terminal state (completed, error, ended)

### Data Architecture

Each project is a **tenant** in GoatDB with its own registry and session repos:

```
.smith/db/                          # GoatDB root (gitignored)
├── registry/                       # Session registry repo (always active)
│   └── sessions/<session-id>       # One item per session (lightweight metadata)
└── sessions/                       # Session repos
    ├── <session-id-1>/             # One repo per workflow execution
    │   └── calls/<call-id>         # One item per tool call
    └── <session-id-2>/
        └── calls/<call-id>
```

### Session Registry

The **registry** is a single GoatDB repo per project that is always active. It stores lightweight metadata for every session, powering the history view (Flow 6).

**`SessionIndexSchema`** (one item per session):

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | string | Unique session identifier |
| `workflowName` | string | Name of the workflow executed |
| `inputs` | object | Workflow global inputs snapshot |
| `status` | enum | `active` / `completed` / `error` / `ended` |
| `startedAt` | ISO-8601 | When execution began |
| `finishedAt` | ISO-8601? | When execution ended (null if active) |
| `filesModified` | number | Count of files touched |
| `toolCallCount` | number | Count of file-modifying tool calls |
| `totalTokens` | number | Total tokens consumed across all steps |
| `tokensByModel` | `Record<string, {prompt: number, completion: number}>` | Per-model token breakdown (key is `provider:model`) |
| `parentSessionId` | string? | If forked, points to source session |
| `forkPoint` | object? | `{ stepName: string, dataType: 'global' \| 'input' \| 'output' }` — where the fork occurred |

**Session Forking**: When a user edits any workflow data (global inputs, step inputs, or step outputs) on a completed step, a new session is forked from that point. The original session is preserved unchanged. The forked session:
- Inherits all data up to the fork point
- Discards all step data after the fork point (marked stale)
- Resumes execution from the edited step

**Commit budget**: The registry accumulates ~1 commit per session start + ~1 per session completion. At ~50 sessions/week (~2,500/year), this stays well within GoatDB's 100k commit limit for ~40 years.

### Session Repo

Each workflow execution gets its own **session repo**. The atomic unit is a **tool call** — not an individual file edit.

**`ToolCallEditSchema`** (one item per file-modifying tool call):

| Field | Type | Description |
|-------|------|-------------|
| `callId` | string | Unique tool call identifier |
| `stepName` | string | Which workflow step produced this call (enables bulk revert for Rewind) |
| `toolName` | string | Tool name (e.g. `write`, `bash`, or any registered tool with `mode: 'edit'`) |
| `callIndex` | number | Position in execution sequence |
| `timestamp` | ISO-8601 | When the call executed |
| `description` | string | Agent's reasoning (WHY) |
| `input` | object | Tool call parameters |
| `snapshots` | `Record<path, content>` | File states **before** this call |
| `results` | `Record<path, content>` | File states **after** this call |
| `revertState` | `Record<path, 'applied' \| 'reverted'>` | Per-file revert status |

**Why tool call, not file-edit?**
- A single `bash` call may modify multiple files — the tool call is the logical grouping
- Matches the user's mental model (they see tool calls in the timeline, not individual writes)
- Maps directly to the UI: each timeline entry = one undo target

**Commit budget**: A typical session produces ~50 tool calls (~50 commits). Well within GoatDB's per-repo limits.

Both `snapshots` (before) and `results` (after) are stored per file because the 3-way merge requires both sides to compute a clean revert.

#### Step Token Usage

**`StepTokenUsageSchema`** (stored under `usage/<step-name>` in each session repo):

| Field | Type | Description |
|-------|------|-------------|
| `stepName` | string | Workflow step identifier |
| `model` | string | Provider:model used (e.g. `openai:gpt-4o`) |
| `promptTokens` | number | Total prompt tokens consumed in this step |
| `completionTokens` | number | Total completion tokens generated in this step |
| `totalTokens` | number | `promptTokens + completionTokens` |
| `requestCount` | number | Number of LLM requests made during this step |

### Recording

Session recording is implemented as **middleware** that wraps tools with `mode: 'edit'`:

1. **Before** the tool executes: snapshot all files the tool will touch (read current disk state → `snapshots`)
2. **Execute** the tool normally
3. **After** the tool completes: record the resulting file states (read disk state → `results`)

This is transparent to the agent — it has no awareness of the recording layer.

**Token recording**: Token usage arrives naturally via the `done` chunk of the `CompletionChunk` stream (see LLM Abstraction). The middleware accumulates per-step totals alongside file snapshots — no special adapter contract is needed. On session completion, per-step totals are summed into `SessionIndexSchema.totalTokens` and `tokensByModel` for project-level lifetime aggregation via registry sum.

### Revert: Selective File Rollback via 3-way Merge

**Revert is a file-only operation.** The workflow and LLM are NOT notified — they continue execution unaware of the file changes. This is analogous to `git checkout -- file` happening outside your editor session.

**Any edit in the session can be reverted at any time**, regardless of its position in the sequence. There is no requirement to revert in reverse order.

To revert tool call **#N**:

1. `base` = file state **before** #N (from `snapshots`)
2. `ours` = file state **after** #N (from `results`)
3. `theirs` = **current** file on disk (reflects all subsequent edits)
4. GoatDB's 3-way merge produces a file that **removes #N's changes** while **preserving all later edits**
5. Apply result to disk

This is analogous to `git revert` (not `git reset`). Edits can be reverted in any order. Multiple non-adjacent edits can be reverted independently. Un-reverting re-applies the original changes via the same merge in reverse.

**Important**: If you revert during execution, the LLM may encounter unexpected file states and fail. Use Pause + Revert + Rewind if you need the workflow to "know" about the change.

### Rewind: Full Pipeline Rollback to Step

**Rewind is a workflow state operation.** Unlike Revert (file-only), Rewind:
1. Bulk-reverts ALL file changes from steps after the target step
2. Resets the workflow state machine to the target step's completion
3. Discards all step outputs after the target step

To rewind to step **X**:

1. Query all tool calls where `stepName` is after X (using step order from workflow definition)
2. Revert each tool call in reverse order via 3-way merge
3. Reset workflow `currentStep` to X
4. Mark all steps after X as `pending`
5. User can now edit step X's outputs and continue

**Use cases**:
- The EXECUTE phase went wrong; rewind to PLAN and adjust the plan
- Multiple steps failed; rewind to a known-good state and retry with different approach
- User wants to explore an alternative path from an earlier decision point

### Rollback Properties

| Property | Revert (File) | Rewind (Pipeline) |
|----------|---------------|-------------------|
| Scope | Single tool call | All steps after target |
| Workflow state | Unchanged | Reset to target step |
| LLM awareness | None | None (fresh context on resume) |
| Use case | Surgical file fix | Change approach entirely |

| Property | Behavior |
|----------|----------|
| Any edit | Revert any tool call, not just the latest |
| Any order | Revert #3 without touching #4 or #5 |
| Non-destructive | Append-only commit graph records every revert/un-revert |
| Partial revert | `revertState` map (per-file, not boolean) supports reverting one file from a multi-file call |
| Conflict-free | GoatDB's 3-way merge always produces a clean result |
| Un-revert | Re-apply a reverted edit via reverse merge |

### GoatDB vs Git

| | GoatDB (Session) | Git (Project) |
|---|---|---|
| **Scope** | Single workflow execution | Entire project history |
| **Granularity** | Tool call (one agent action) | Commit (intentional checkpoint) |
| **Lifetime** | Ephemeral (GC'd after finalization) | Permanent |
| **Rollback** | Selective revert of any tool call via 3-way merge | `git revert` of any commit |

### Session Repo Lifecycle

| State | Description |
|-------|-------------|
| **Created** | Session repo initialized when workflow starts |
| **Active** | Recording tool calls during execution |
| **Finalized** | Workflow completed/ended/errored; snapshots GC'd to reclaim disk space (metadata retained) |
| **Deactivated** | Session repo closed, registry entry preserved |
| **Archived** | (Optional) Session data exported for long-term storage |

## Configuration

S.M.I.T.H uses file-based configuration following modern dev tool patterns (similar to Claude Code). Secrets live in environment variables, settings in JSON files.

### LLM Abstraction

S.M.I.T.H consumes LLMs through a single capability interface. All provider-specific concerns (auth, binary paths, HTTP endpoints, detection) are encapsulated inside **adapters** — S.M.I.T.H never sees them.

```typescript
// The only contract between S.M.I.T.H and any LLM
interface LLMProvider {
  complete(request: CompletionRequest): AsyncStream<CompletionChunk>
}

interface CompletionRequest {
  model: string
  systemPrompt: string
  messages: Message[]
  tools: ToolDefinition[]
  maxTokens: number
}

interface CompletionChunk {
  type: 'text' | 'tool_call' | 'done'
  // 'done' chunk includes usage: { promptTokens, completionTokens }
}
```

- S.M.I.T.H calls `complete()` — it never knows about CLI pipes, HTTP calls, or auth flows
- Token usage arrives as part of the completion stream (the `done` chunk)
- Each adapter is an npm package that implements `LLMProvider`
- One builtin adapter ships pre-installed: `@smith/provider-openai` — authenticates via OAuth against the user's ChatGPT subscription. OpenAI actively welcomes third-party tools using their subscription, making it the only provider where S.M.I.T.H can offer zero-config built-in access.
- All other providers (Anthropic, Ollama, custom endpoints) are installable as adapter packages — structurally identical to the builtin, just not shipped by default.
- Users can add any provider by installing an adapter package and adding a `providers` entry. No S.M.I.T.H upgrade required.

### Tool Abstraction

S.M.I.T.H consumes tools through a single capability interface — the same pattern as LLM adapters. SMITH needs one capability from a tool: take structured input, produce a result. Everything else (filesystem APIs, shell spawning, MCP protocol) is the tool package's internal concern.

```typescript
interface Tool {
  name: string
  description: string
  mode: 'readonly' | 'edit'
  parameters: JSONSchema
  execute(input: unknown): Promise<ToolResult>
}

interface ToolResult {
  content: string
  metadata?: Record<string, unknown>
}
```

- `mode` determines recording behavior — tools with `mode: 'edit'` are wrapped by session recording middleware with before/after snapshots
- Bundled tools: `@smith/tool-read`, `@smith/tool-write`, `@smith/tool-glob`, `@smith/tool-grep`, `@smith/tool-bash`
- MCP bridged via `@smith/tool-mcp` — reads `mcp.servers` config, exposes each MCP server tool as a `Tool` instance
- `ToolDefinition` (derived from `Tool`: name, description, parameters) is the subset sent to LLMs inside `CompletionRequest` — `execute` stays on S.M.I.T.H's side
- Bundled tools auto-register (shipped with S.M.I.T.H). The `tools` section in settings is for adding user-installed tools or overriding config. Default `settings.json` doesn't need a `tools` section.
- Users add tools by installing a package and adding a `tools` entry in settings

### Settings Hierarchy

Configuration exists at three levels: user → project → local (local wins):

```
~/.smith/
├── settings.json              # User-level defaults
└── workflows/                 # Shared workflow templates

my-project/.smith/
├── settings.json              # Project-specific overrides (tracked)
├── settings.local.json        # Personal overrides (gitignored)
└── workflows/                 # Project workflows (tracked)
```

### Model Reference Format

Models are referenced as `<provider>:<model>`:

| Example | Description |
|---------|-------------|
| `openai:gpt-4o` | GPT-4o via ChatGPT subscription (built-in) |
| `openai:o1` | o1 via ChatGPT subscription (built-in) |
| `anthropic:claude-sonnet-4-20250514` | Claude via API (user-installed adapter) |
| `ollama:llama3.2` | Local Ollama (user-installed adapter) |

### User-Level Settings (`~/.smith/settings.json`)

`providers` is a registry of adapter references and model lists:

```json
{
  "providers": {
    "openai": {
      "adapter": "@smith/provider-openai",
      "models": ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"]
    }
  },
  "defaults": {
    "model": "openai:gpt-4o",
    "maxTokens": 8192
  },
  "mcp": {
    "servers": {}
  }
}
```

**Adding providers**: Install an adapter package, then add a `providers` entry. Example for Anthropic:

```json
{
  "providers": {
    "anthropic": {
      "adapter": "@smith/provider-anthropic",
      "config": { "baseUrl": "https://api.anthropic.com/v1" },
      "models": ["claude-sonnet-4-20250514", "claude-opus-4-1-20250414"]
    }
  }
}
```

- `adapter` is a module reference — S.M.I.T.H resolves and loads it
- `config` is opaque to S.M.I.T.H, passed through to the adapter
- `models` lists what the user can reference as `provider:model`
- Auth, detection, binary paths — all inside the adapter, never in S.M.I.T.H's schema
- Users can add any provider by installing an adapter package and adding a `providers` entry. No S.M.I.T.H upgrade required.

### Project-Level Settings (`.smith/settings.json`)

```json
{
  "defaults": {
    "model": "gpt-4o-mini"
  },
  "mcp": {
    "servers": {
      "database": {
        "command": "npx",
        "args": ["@mcp/postgres", "--connection-string", "$DATABASE_URL"]
      }
    }
  },
  "workflows": {
    "plan-execute": {
      "steps": {
        "research": { "model": "openai:gpt-4o-mini" },
        "plan": { "model": "openai:o1" }
      }
    }
  }
}
```

### Local Settings (`.smith/settings.local.json`)

Personal per-project overrides not shared with the team. Use cases include switching the default model for local testing, machine-specific MCP server configuration, or custom token limits.

```json
{
  "defaults": {
    "model": "ollama:llama3.2"   // Requires user-installed @smith/provider-ollama adapter
  },
  "mcp": {
    "servers": {
      "local-db": {
        "command": "npx",
        "args": ["@mcp/postgres", "--connection-string", "$LOCAL_DATABASE_URL"]
      }
    }
  }
}
```

- Created on-demand by the user or settings UI — **not** during `smith init`
- Automatically gitignored (the ignore rule is added during init)

### Merge Strategy

Resolution order: **local → project → user** (local wins).

| Key | Strategy | Behavior |
|-----|----------|----------|
| `providers` | Deep merge | Local adds to project + user |
| `tools` | Deep merge | Local adds to project + user |
| `mcp.servers` | Deep merge | Local adds to project + user |
| `defaults` | Override | Local overrides project overrides user |
| `workflows` | Step override | Local step overrides on top of project step overrides |

### Provider Detection

On launch, S.M.I.T.H iterates registered providers and calls each adapter's availability check. On first launch, only the built-in `@smith/provider-openai` is scanned. User-installed adapters are also scanned if present. Detection is adapter-internal — not part of the `LLMProvider` interface — and is a UI concern for the settings screen, not a core abstraction.

- Each adapter implements its own detection logic (OAuth state, env var, HTTP ping, etc.)
- Adapters that can't connect report themselves as unavailable with adapter-specific hints
- Detection results are displayed dynamically in the Welcome Modal (Flow -1) and Settings (Flow 8)
- S.M.I.T.H has no hardcoded vendor-specific detection logic

## Settings UI

Minimal UI accessed via `[*]` button in tab bar. Provider list is rendered dynamically from the adapter registry — any installed adapter shows up automatically. Grouped by adapter-reported category if available, otherwise shown as a flat list.

```
+-------------------------------------------+
|  SETTINGS                            [X]  |
+-------------------------------------------+
|  EXECUTION MODE                           |
|  ○ Confirm All  ● Steps Only  ○ YOLO      |
|                                           |
|  PROVIDERS                                |
|                                           |
|  [*] OpenAI (built-in)   [available]      |
|      gpt-4o, gpt-4o-mini, o1, o1-mini    |
|                                           |
|  [+ Add Provider]                         |
|                                           |
|  TOOLS                                    |
|                                           |
|  [*] read         @smith/tool-read        |
|  [*] write        @smith/tool-write       |
|  [*] glob         @smith/tool-glob        |
|  [*] grep         @smith/tool-grep        |
|  [*] bash         @smith/tool-bash        |
|  [*] mcp          @smith/tool-mcp         |
|                                           |
|  [+ Add Tool]                             |
|                                           |
|  DEFAULT MODEL                            |
|  [openai:gpt-4o____________________|v]    |
|                                           |
|  [+ Advanced Options]                     |
|                                           |
|  Config:  ~/.smith/settings.json          |
|  Project: .smith/settings.json           |
|  Local:   .smith/settings.local.json     |
|                         [Close]           |
+-------------------------------------------+
```

**Key behaviors**:
- **Execution Mode** controls intervention frequency (see Workflow section for details)
- Provider list rendered from registry — any adapter shows up automatically
- Each adapter reports its own availability status and hint text
- `[+ Add Provider]` opens docs/config guidance for adding adapter packages
- Model dropdown prefixes with provider (e.g., `openai:`)
- Footer shows all three config file paths for manual editing
- Values overridden by local settings show a "(local override)" hint

Advanced configuration is done by editing `settings.json` directly.

## Workflows

`<workflow name>` dirs placed under the `.smith/workflows/` dir. Each one should have a `smith.ts` at its root which is the main entry point.

### Workflow I/O Model

Workflows have a three-tier data model:

1. **Global Inputs** — Available to ALL steps; set once at workflow start
2. **Step Inputs** — Per-step; can reference globals or prior step outputs via functions
3. **Step Outputs** — Explicitly declared schema; LLM output is validated against it

This enables users to inspect and edit any data point when the workflow is paused. Editing a completed step's data forks the session (see Session Forking).

### Workflow Definition (`smith.ts`)

Each step can specify its own LLM, tools, inputs, and outputs:

```typescript
import { defineWorkflow, step, tools } from '@smith/sdk';

export default defineWorkflow({
  name: 'Plan Execute',
  description: 'Research -> Plan -> Execute with approval',

  // GLOBAL INPUTS - available to ALL steps
  inputs: {
    task: { type: 'string', required: true, label: 'Task Description' },
    scope: { type: 'string', required: false, default: '**/*' }
  },

  steps: [
    step('research', {
      model: 'openai:gpt-4o-mini',           // Fast, cheap for exploration
      tools: [tools.read, tools.glob, tools.grep],

      // STEP INPUTS - can reference globals or prior step outputs
      inputs: {
        query: ({ globals }) => globals.task,
        targetFiles: ({ globals }) => globals.scope
      },

      // STEP OUTPUTS - explicit schema, validated
      outputs: {
        findings: { type: 'string', description: 'Summary of research findings' },
        relevantFiles: { type: 'array', items: 'string' }
      },

      prompt: ({ inputs }) => `Research the codebase for: ${inputs.query}`
    }),

    step('plan', {
      model: 'openai:o1',                    // Smarter model for planning
      tools: [tools.read],
      approval: 'required',                  // Always pause regardless of YOLO mode

      inputs: {
        context: ({ steps }) => steps.research.outputs.findings,
        files: ({ steps }) => steps.research.outputs.relevantFiles
      },

      outputs: {
        plan: { type: 'string' },
        tasks: { type: 'array', items: { type: 'object' } }
      },

      prompt: ({ inputs }) => `Create a plan based on: ${inputs.context}`
    }),

    step('execute', {
      // Uses project/user default model if not specified
      tools: [tools.read, tools.write, tools.bash],
      approval: 'default',                   // Follow global execution mode

      inputs: {
        plan: ({ steps }) => steps.plan.outputs.plan,
        tasks: ({ steps }) => steps.plan.outputs.tasks
      },

      outputs: {
        summary: { type: 'string' }
      },

      prompt: ({ inputs }) => `Execute the approved plan: ${inputs.plan}`
    })
  ]
});
```

### Step Approval Modes

Each step can override the global execution mode:

| Value | Behavior |
|-------|----------|
| `'required'` | Always pause before this step, regardless of global mode |
| `'skip'` | Never pause before this step, regardless of global mode |
| `'default'` | Follow the global execution mode (default if not specified) |

### Global Execution Modes (YOLO Toggle)

Users select their preferred intervention level in the UI:

| Mode | Behavior |
|------|----------|
| `confirm-all` | Pause before every step AND before every tool call |
| `confirm-steps` | Pause between steps only; auto-approve tool calls within a step |
| `yolo` | Auto-continue everything; only pause on errors or `approval: 'required'` steps |

**Operator intervention can ONLY occur:**
1. Between workflow steps (step boundaries)
2. Before any tool call (in `confirm-all` mode)

There is no free-form chat. All user influence flows through editing structured I/O data.

### Step Context Isolation

**Each step is a fresh LLM invocation.** Steps do NOT share:
- Conversation history
- Reasoning traces
- Tool call logs
- Memory of prior steps' internal processing

Steps ONLY receive:
- Their own system prompt (from workflow definition)
- Their own input data (resolved from globals/prior outputs)
- Their configured tools

This is fundamental to S.M.I.T.H's design:
- Different steps can use different LLMs (gpt-4o for research, o1 for planning, claude for execution)
- Context is precisely engineered per step, not accumulated
- No "context window bloat" from long-running sessions

```
┌─────────────┐     structured      ┌─────────────┐     structured      ┌─────────────┐
│  RESEARCH   │ ──── data only ───→ │    PLAN     │ ──── data only ───→ │   EXECUTE   │
│  (gpt-4o)   │                     │    (o1)     │                     │  (claude)   │
└─────────────┘                     └─────────────┘                     └─────────────┘
     ↑                                    ↑                                   ↑
  fresh context                      fresh context                       fresh context
```

### Model Resolution Order

For each step, the model is resolved in this order:
1. Step-level `model` in `smith.ts`
2. Workflow override in `.smith/settings.json` → `workflows.<name>.steps.<step>.model`
3. Project default in `.smith/settings.json` → `defaults.model`
4. User default in `~/.smith/settings.json` → `defaults.model`
5. Built-in fallback: `openai:gpt-4o`

### Bundled Tools

| Tool | Package | Description | Mode |
|------|---------|-------------|------|
| `tools.read` | `@smith/tool-read` | Read file contents | `readonly` |
| `tools.write` | `@smith/tool-write` | Write/create files | `edit` |
| `tools.glob` | `@smith/tool-glob` | Find files by pattern | `readonly` |
| `tools.grep` | `@smith/tool-grep` | Search file contents | `readonly` |
| `tools.bash` | `@smith/tool-bash` | Execute shell commands | `edit` |

MCP tools are provided by `@smith/tool-mcp`, which bridges MCP servers (configured in `mcp.servers`) to the `Tool` interface. Each MCP server tool becomes a `Tool` instance with the mode reported by the server.

> **Edit tracking**: Tools with `mode: 'edit'` are intercepted by session recording middleware — the `mode` is declared by the `Tool` interface, not a hardcoded list. Each call is captured as a GoatDB item with before and after snapshots of affected files. Any edit can be selectively reverted at any time via GoatDB's 3-way merge — not limited to the latest edit. See Session Model.