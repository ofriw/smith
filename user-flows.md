# S.M.I.T.H User Flows

1. A step can proactively Ask user for input 

This document describes the main user flows for S.M.I.T.H (Structured Multi-model Intelligent Task Handler).

## Notation

```
[State]            Rectangle: A distinct application state
◇ Decision?        Diamond: A decision point requiring user action
→                  Arrow: Flow direction
├─ / └─            Branch: Alternative paths from a decision
```

---

## Flow -1: First Launch

**Entry**: User opens S.M.I.T.H for the first time (no `~/.smith/` exists)
**Goal**: Detect available providers and create user-level configuration

```
[App Launch]
      ↓
◇ ~/.smith/ exists?
      │
      ├─ Yes → Flow 0
      │
      └─ No  → [Detect Providers]
                     │
                     ↓
              [Welcome Modal]
                     │
                     │  Scans registered adapters for availability,
                     │  renders results dynamically.
                     │
                     │  ┌─────────────────────────────────────────┐
                     │  │  WELCOME TO S.M.I.T.H                   │
                     │  │                                         │
                     │  │  S.M.I.T.H connects to your ChatGPT    │
                     │  │  subscription via OAuth.                │
                     │  │                                         │
                     │  │  [*] OpenAI (built-in)  [available]     │
                     │  │      gpt-4o, gpt-4o-mini, o1, o1-mini  │
                     │  │                                         │
                     │  │  Additional providers (Anthropic,       │
                     │  │  Ollama, etc.) can be installed as      │
                     │  │  adapter packages.                      │
                     │  │                                         │
                     │  │  Default model:                         │
                     │  │  [openai:gpt-4o__________________|v]    │
                     │  │                                         │
                     │  │  Configuration will be stored in        │
                     │  │  ~/.smith/settings.json                 │
                     │  │                                         │
                     │  │              [Get Started]              │
                     │  └─────────────────────────────────────────┘
                     │
                     ↓
              [Click Get Started]
                     │
                     ↓
              [Create ~/.smith/]
              [Write settings.json with openai provider]
              [Set default model to openai:gpt-4o]
                     │
                     ↓
                → Flow 0
```

### Steps

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens application | Checks for ~/.smith/ directory |
| 2 | — | Checks OpenAI OAuth availability; detects any user-installed adapters |
| 3 | (Optional) Selects default model | Updates selection |
| 4 | Clicks "Get Started" | Creates ~/.smith/ and settings.json |
| 5 | — | Proceeds to Project Selection |

### Provider Detection

Detection is adapter-driven — each registered adapter implements its own availability check. S.M.I.T.H iterates all adapters and renders results dynamically. No hardcoded vendor logic.

| Adapter | Detection (adapter-internal) |
|---------|----------------------------|
| `@smith/provider-openai` (built-in) | OAuth state check |
| User-installed adapters | Adapter-defined |

### Edge Cases
- OpenAI unavailable: Show OAuth login prompt
- No providers detected: Show warning, allow continue with manual setup later
- Adapter reports available: Pre-select first available as default
- Adapter reports unavailable: Show adapter-specific hint text
- Detection error: Mark as unavailable, don't block

---

## Flow 0: Open Project

**Entry**: User opens S.M.I.T.H (has `~/.smith/`, no project open)
**Goal**: Open an initialized project or initialize a new one

```
[App Launch / From Flow -1]
      ↓
[Project Browser Screen]
      │
      │  ┌─────────────────────────────────────────┐
      │  │  S.M.I.T.H                              │
      │  │                                         │
      │  │        [Open Folder]                    │
      │  │                                         │
      │  │  RECENT PROJECTS                        │
      │  │  ● my-api              main             │
      │  │    ~/projects/my-api                    │
      │  │  ○ backend-v2          develop          │
      │  │    ~/projects/backend-v2                │
      │  │                                         │
      │  └─────────────────────────────────────────┘
      │
      ├─────────────────┬─────────────────┐
      ↓                 ↓                 ↓
[Open Folder]    [Click Recent]    [Initialize New]
      │                 │                 │
      ↓                 │                 │
[Native Picker]        │                 │
      │                 │                 │
      ↓                 │                 │
◇ .smith/ valid?       │                 │
      │                 │                 │
      ├─ Yes ───────────┴─────────────────┘
      │                 ↓
      │        [Add to Sidebar]
      │        [Activate GoatDB Sync]
      │                 ↓
      │        [Project Loaded - Full Workspace]
      │                 ↓
      │            → Flow 1
      │
      └─ No  → [Initialize Project Modal]
                     │
                     │  ┌─────────────────────────────────┐
                     │  │  INITIALIZE S.M.I.T.H           │
                     │  │                                 │
                     │  │  This folder needs S.M.I.T.H    │
                     │  │  initialization to be opened.   │
                     │  │                                 │
                     │  │  This will create:              │
                     │  │  • .smith/settings.json         │
                     │  │  • .smith/workflows/            │
                     │  │  • .smith/db/                   │
                     │  │                                 │
                     │  │  .gitignore will be updated.    │
                     │  │                                 │
                     │  │    [Cancel]  [Initialize]       │
                     │  └─────────────────────────────────┘
                     ↓
               ◇ User choice?
                     │
                     ├─ Initialize → [Create .smith/]
                     │                    ↓
                     │              [Add to Sidebar]
                     │              [Activate GoatDB Sync]
                     │                    ↓
                     │              → Flow 1
                     │
                     └─ Cancel → [Return to Project Browser]
```

**Key model**: A project can only be opened if it has a valid `.smith/` directory. Opening = adding to sidebar + activating GoatDB sync. Folders without `.smith/` must be initialized first.

### Project States

| State | In Sidebar | GoatDB Active | .smith/ Valid |
|-------|------------|---------------|---------------|
| Uninitialized | No | No | No |
| Closed | No | No | Yes (can be reopened) |
| Open | Yes | Yes | Yes |

### Steps

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Opens application | Shows project browser screen |
| 2a | Clicks "Open Folder" | Opens native file picker |
| 2b | Clicks recent project | Loads that project directly (already initialized) |
| 3 | Selects folder | Checks for valid `.smith/` |
| 4a | (If initialized) | Opens project, proceeds to Flow 1 |
| 4b | (If not initialized) | Shows initialization modal |
| 5 | Clicks "Initialize" | Creates `.smith/`, opens project, proceeds to Flow 1 |

### Recent Projects Display

| Field | Description |
|-------|-------------|
| Name | Project name |
| Branch | Current git branch (if git repo) |
| Path | Filesystem path (shortened with ~) |

The recent list shows **only initialized projects** — folders that have been set up with `.smith/`. This acts as a "known projects" registry. Projects that are currently closed (not in sidebar) can be quickly reopened from this list.

### Initialization Structure

When a folder is initialized:

```
.smith/
├── settings.json      # Empty project settings (inherits from ~/.smith/)
├── workflows/         # Empty, ready for custom workflows
└── db/
    └── registry/      # GoatDB session registry (initialized empty)
```

Gitignore rules are appended:
```
.smith/db/
.smith/settings.local.json
```

- Only missing entries are appended — existing rules are not duplicated
- `settings.local.json` is **not** created during init — only the ignore rule is added

### Edge Cases
- Corrupted `.smith/`: Show recovery options (reset, backup, continue)
- Recent project deleted from disk: Remove from list, show toast
- Recent project `.smith/` removed: Show as unavailable, offer re-initialization
- No recent projects: Hide section, emphasize Open Folder

---

## Flow 1: Workspace - Empty State

**Entry**: Project is open (initialized + in sidebar), no active workflow
**Goal**: Start a new workflow or resume recent work in THIS project

```
[Project Loaded]
      ↓
[Workspace Empty State]
      │
      │  ┌──────────────┬──────────────────────────────────────────────┐
      │  │  PROJECTS    │  Tabs: [+]                                   │
      │  │              ├──────────────────────────────────────────────┤
      │  │  ● my-api    │                                              │
      │  │    main      │  my-api                          /main       │
      │  │              │  /Users/me/projects/my-api                   │
      │  │  ○ backend   │                                              │
      │  │    develop   │  [Type workflow name or...]                  │
      │  │              │                                              │
      │  │  [+ Open]    │  USER WORKFLOWS (~/.smith/workflows/)        │
      │  │              │  ○ plan-execute                              │
      │  │              │    Research -> Plan -> Execute               │
      │  │              │  ○ code-review                               │
      │  │              │    Analyze -> Report                         │
      │  │              │                                              │
      │  │              │  PROJECT WORKFLOWS (.smith/workflows/)       │
      │  │              │  ○ fix-bug                                   │
      │  │              │    Diagnose -> Fix -> Verify                 │
      │  │              │  [+ Create Custom Workflow]                  │
      │  │              │                                              │
      │  │              │  RECENT (this project)                       │
      │  │              │  • Refactor authentication module       2h   │
      │  │              │  • Fix bug #42 - null pointer           1d   │
      │  │              │                                              │
      │  └──────────────┴──────────────────────────────────────────────┘
      │
      ├─────────────────┬─────────────────┬─────────────────┐
      ↓                 ↓                 ↓                 ↓
[Type Search]    [Click Workflow] [Click Recent]    [Switch Project]
      │                 │                 │                 │
      │                 └─────────────────┘                 │
      │                         ↓                          │
      │               [Workflow Selection Modal]            │
      │                         ↓                          │
      │                    → Flow 2                        │
      │                                                    │
      └────────────────────────────────────────────────────┘
                                ↓
                    [Load Different Project's Workspace]
```

### Steps

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Project loads | Shows workspace with project context |
| 2a | Types workflow name | Filters available workflows |
| 2b | Clicks workflow | Opens workflow selection pre-filled |
| 2c | Clicks recent item | Opens workflow selection for that workflow |
| 2d | Clicks project in sidebar | Switches to that project's workspace |
| 3 | — | Proceeds to Flow 2 |

### Workspace Context

| Element | Source |
|---------|--------|
| Project name | Folder name |
| Branch | Git current branch (if git repo) |
| Workflow list | `~/.smith/workflows/` + `.smith/workflows/` |
| Recent list | `.smith/db/registry/` |

All projects in the sidebar are initialized by definition — only initialized projects can be opened.

### Edge Cases
- No recent workflows: Hide "Recent" section
- Project without git: Hide branch indicator

---

## Flow 2: Start Workflow

**Entry**: User is in an open project, triggered workflow selection
**Goal**: Configure global inputs and launch a workflow
**Prerequisite**: Project must be open (initialized + in sidebar, Flow 0 completed)

```
[Workflow Selection Modal]
      │
      │  ┌─────────────────────────────────────────┐
      │  │  SELECT WORKFLOW           my-api   [X] │
      │  │                                         │
      │  │  USER WORKFLOWS (~/.smith/workflows/)   │
      │  │  ○ Plan Execute                          │
      │  │    Research -> Plan -> Execute          │
      │  │  ○ Code Review                          │
      │  │    Analyze -> Report                    │
      │  │                                         │
      │  │  PROJECT WORKFLOWS (.smith/workflows/)  │
      │  │  ● Add Feature          ← selected      │
      │  │    Research -> Plan -> Execute          │
      │  │  ○ Fix Bug                              │
      │  │    Diagnose -> Fix -> Verify            │
      │  │                                         │
      │  │  ─────────────────────────────────────  │
      │  │  GLOBAL INPUTS                          │
      │  │                                         │
      │  │  TASK DESCRIPTION *                     │
      │  │  [________________________]             │
      │  │  TARGET SCOPE *                         │
      │  │  [src/features/**_________]             │
      │  │                                         │
      │  │  EXECUTION MODE                         │
      │  │  ○ Confirm All  ● Steps Only  ○ YOLO   │
      │  │                                         │
      │  │        [Cancel]  [Start Workflow]       │
      │  └─────────────────────────────────────────┘
      ↓
[Select Workflow Type]
      ↓
[Fill Global Inputs] ← dynamic fields from workflow.inputs schema
      ↓
◇ Inputs valid?
      ├─ No  → [Show Validation Errors]
      │              ↓
      │        [User Corrects]
      │              ↓
      └─ Yes → [Click Start Workflow]
                     ↓
              [Create New Session Tab]
                     ↓
                → Flow 3
```

Since projects must be initialized before they can be opened (see Flow 0), the `.smith/` directory is guaranteed to exist when starting a workflow.

### Steps

| Step | User Action | System Response |
|------|-------------|-----------------|
| 1 | Views workflow list | Shows user and project workflows |
| 2 | Selects workflow type | Reveals workflow's global input fields |
| 3 | Fills global inputs | Validates against schema |
| 4 | Selects execution mode | Sets intervention level |
| 5 | Clicks "Start Workflow" | Validates all inputs |
| 6 | — | Creates session tab, GoatDB session repo, begins execution |

### Workflow Sources

| Source | Path | Priority |
|--------|------|----------|
| User workflows | `~/.smith/workflows/` | Always available |
| Project workflows | `.smith/workflows/` | Override user with same name (only if initialized) |

Same-name shadowing: project > user. At MVP, users install custom workflows manually by placing them in the appropriate directory.

### Global Inputs

Global inputs are defined in the workflow's `inputs` schema and are available to ALL steps:

| Workflow | Required Global Inputs | Optional Global Inputs |
|----------|------------------------|------------------------|
| Plan Execute | Task description | Target scope, constraints |
| Fix Bug | Bug description | Related files, test file |
| Add Feature | Feature description | Target scope |
| Code Review | Scope/files | Review focus areas |

### Execution Mode Selection

| Mode | Behavior |
|------|----------|
| Confirm All | Pause before every step AND before every tool call |
| Steps Only (default) | Pause between steps only; auto-approve tool calls |
| YOLO | Auto-continue everything; only pause on errors |

### Edge Cases
- Cancel: Returns to workspace, no session created
- Invalid inputs: Highlight errors, disable Start button
- File path inputs: Autocomplete from project directory structure

---

## Flow 3: Workflow Execution

**Entry**: Workflow started
**Goal**: Complete all pipeline steps based on execution mode

```
[Active Session]
      │
      │  ┌───────────────────────────────────────────────────────────────┐
      │  │  Tabs: [my-api: Plan Execute] [Bug Fix #42] [+]               │
      │  ├───────────────────────────────────────────────────────────────┤
      │  │  MODE: ○ Confirm All  ● Steps Only  ○ YOLO                    │
      │  │  ─────────────────────────────────────────────────────────────│
      │  │  ● RESEARCH ──[Rewind]── ● PLAN ──[Rewind]── ○ EXECUTE        │
      │  └───────────────────────────────────────────────────────────────┘
      │
      ↓
[Step Execution Loop]
      │
      ├─ In YOLO mode: Auto-continue to next step
      │
      └─ In Confirm modes: Pause at step boundary
               │
               │  ┌─────────────────────────────────────────────────────┐
               │  │  STEP COMPLETED: RESEARCH                           │
               │  ├─────────────────────────────────────────────────────┤
               │  │  INPUTS                                    [View]   │
               │  │  query: "Refactor authentication module"            │
               │  │  targetFiles: "src/auth/**"                         │
               │  │                                                     │
               │  │  OUTPUTS                                   [Edit]   │
               │  │  findings: "The auth module has 3 main..."  (1.2k)  │
               │  │  relevantFiles: ["src/auth/index.ts", ...]  (12)    │
               │  │                                                     │
               │  │       [Rewind to Here]  [Edit & Fork]  [Continue]   │
               │  └─────────────────────────────────────────────────────┘
               ↓
         ◇ User action?
               │
               ├─ [Continue] → [Next Step Begins]
               │
               ├─ [Edit & Fork] → [Edit outputs in modal]
               │                        ↓
               │                  [Create forked session]
               │                        ↓
               │                  [Continue from this step with edited data]
               │
               └─ [Rewind to Here] → [Confirmation dialog]
                                          ↓
                                    [Bulk revert all later file changes]
                                          ↓
                                    [Reset workflow state to this step]

[EXECUTE Phase - With Edit Tools]
      │
      │  ┌───────────────────────────────────────────────────────────────┐
      │  │  3  EXECUTE                                        [running]  │
      │  │                                                               │
      │  │  > ReadFile src/auth/types.ts                         [done]  │
      │  │  > WriteFile src/auth/errors.ts                       [done]  │
      │  │    [Revert]  ← file-only, workflow unaware                    │
      │  │  > WriteFile src/auth/index.ts                        [done]  │
      │  │    [Revert]                                                   │
      │  │  > Bash npm run typecheck                          [running]  │
      │  │                                                               │
      │  │  ──────────────────────────────────────────────────────────── │
      │  │  [Pause]  [Rewind to PLAN]                                    │
      │  └───────────────────────────────────────────────────────────────┘
      │
      ├─ [User clicks Revert on any call]
      │        ↓
      │  [3-way merge → apply to disk immediately]
      │        ↓
      │  [Execution CONTINUES UNAWARE]
      │  (LLM context unchanged; may fail or produce unexpected results)
      │
      ├─ [User clicks Pause]
      │        ↓
      │  [Execution suspended]
      │        ↓
      │  [Can: Resume, Revert calls, Rewind to step, End session]
      │
      ↓
◇ Execution succeeds?
      │
      ├─ Yes → [Completion Screen]
      │              ↓
      │         → Flow 4
      │
      └─ No  → [Error State]
                    ↓
               → Flow 5
```

### Execution Mode Behavior

| Mode | Step Boundaries | Tool Calls |
|------|-----------------|------------|
| Confirm All | Pause and wait for [Continue] | Pause and wait for confirmation |
| Steps Only | Pause and wait for [Continue] | Auto-approve |
| YOLO | Auto-continue (unless `approval: 'required'`) | Auto-approve |

Steps with `approval: 'required'` in their definition ALWAYS pause regardless of mode.

### Phase Details

| Phase | Agent Mode | User Interaction | Recording |
|-------|------------|------------------|-----------|
| RESEARCH | Readonly | View I/O, Edit & Fork, Rewind | None (readonly) |
| PLAN | Readonly | View I/O, Edit & Fork, Rewind | None (readonly) |
| EXECUTE | Edit-enabled | Revert files, Rewind, Pause | Each edit call (before + after snapshots) |

### Controls During Execution

| Control | Behavior |
|---------|----------|
| Pause | Suspends execution; can resume, revert, rewind, or end session |
| Revert | Revert specific file changes via 3-way merge; **workflow continues unaware** |
| Rewind | Bulk-revert all files from later steps AND reset workflow state |
| Edit & Fork | Edit step I/O, create forked session, continue from edited state |

### Revert vs Rewind

**These are fundamentally different operations:**

| | Revert | Rewind |
|---|--------|--------|
| **Scope** | Single tool call's file changes | All file changes from steps after target |
| **Workflow state** | Unchanged (continues unaware) | Reset to target step |
| **LLM awareness** | None — execution continues with old context | None — fresh context on resume |
| **Use case** | Quick file fix during execution | Change approach entirely |

**Revert during execution:**
```
[Execution running]
      ↓
[User clicks Revert on tool call #2]
      ↓
[3-way merge applied to disk immediately]
      ↓
[Execution CONTINUES — LLM doesn't know about the revert]
      ↓
[Step may fail or behave unexpectedly]
      ↓
[User can then: Pause, Retry, or Rewind]
```

**Rewind to step:**
```
[Any state: running, paused, completed, error]
      ↓
[User clicks Rewind to PLAN]
      ↓
[Confirmation: "This will revert 3 files and discard EXECUTE outputs"]
      ↓
[Bulk revert all EXECUTE tool calls via 3-way merge]
      ↓
[Reset workflow state to post-PLAN]
      ↓
[User can now: Edit PLAN outputs, Continue to EXECUTE]
```

### I/O Editing UI (When Paused)

```
┌─────────────────────────────────────────────────────────────────────┐
│  SESSION: Plan Execute                               [Paused]       │
├─────────────────────────────────────────────────────────────────────┤
│  GLOBAL INPUTS                                           [Edit]     │
│  task: "Refactor authentication module"                             │
│  scope: "src/auth/**"                                               │
├─────────────────────────────────────────────────────────────────────┤
│  ● RESEARCH [completed]                         [View] [Edit & Fork]│
│    Inputs:  query, targetFiles                                      │
│    Outputs: findings (1.2k chars), relevantFiles (12)               │
│                                                                     │
│  ● PLAN [completed]                             [View] [Edit & Fork]│
│    Inputs:  context, files                                          │
│    Outputs: plan (2.4k chars), tasks (5)                            │
│                                                                     │
│  ○ EXECUTE [pending]                                                │
│    Inputs:  plan, tasks (from PLAN outputs)                         │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  [Rewind to RESEARCH]  [Rewind to PLAN]  [Resume]  [End Session]    │
└─────────────────────────────────────────────────────────────────────┘
```

Editing any completed step's I/O creates a **forked session** — the original is preserved.

### Edge Cases
- User pauses mid-execution: State preserved, can resume
- User ends session from pause: Session marked as "ended"; changes remain on disk; revert available from history
- LLM rate limit: Auto-pause with retry countdown
- Revert during pause: Allowed; applied immediately
- Readonly calls: No revert button (no file changes)
- Revert + un-revert same call: Idempotent (returns to original via reverse merge)
- Edit completed step: Creates forked session, original preserved

---

## Flow 4: Workflow Completion

**Entry**: All pipeline phases completed successfully
**Goal**: Review results and verify quality

```
[Workflow Complete]
      │
      │  ┌───────────────────────────────────────────────────────────────┐
      │  │  ● WORKFLOW COMPLETE                               [success]  │
      │  │                                                               │
      │  │  EXECUTION SUMMARY                                            │
      │  │  Total Duration          03:42                                │
      │  │  Total Tokens            4.2k                                 │
      │  │                                                               │
      │  │  STEP BREAKDOWN                                               │
      │  │  1. Research     00:45 | 0.8k tokens  openai:gpt-4o-mini      │
      │  │  2. Plan         01:12 | 1.4k tokens  openai:o1               │
      │  │  3. Execute      01:45 | 2.0k tokens  openai:gpt-4o           │
      │  │                                                               │
      │  │  ─────────────────────────────────────────────────────────    │
      │  │  FILE CHANGES                                                 │
      │  │  Tool calls: 3  Files modified: 4                             │
      │  │                                                               │
      │  │  #3 WriteFile src/auth/index.ts               [Revert]        │
      │  │  #2 Bash npm run typecheck                    [Revert]        │
      │  │  #1 WriteFile src/auth/errors.ts              [Revert]        │
      │  │                                                               │
      │  │  ⓘ Revert changes files only. Workflow state unchanged.       │
      │  │                                                               │
      │  │  ─────────────────────────────────────────────────────────    │
      │  │  VERIFICATION                                                 │
      │  │  [✓] TypeScript compilation                                   │
      │  │  [✓] ESLint checks                                            │
      │  │  [✓] Unit tests (24/24 passing)                               │
      │  │  [✓] No security warnings                                     │
      │  │                                                               │
      │  │  ─────────────────────────────────────────────────────────    │
      │  │  GIT STATUS                                                   │
      │  │  M  src/auth/index.ts                                         │
      │  │  A  src/auth/errors.ts                                        │
      │  │  A  src/auth/validator.ts                                     │
      │  │  M  src/auth/types.ts                                         │
      │  │                                                               │
      │  │  [View Diff]  [New Workflow]  [Rewind to Step]                │
      │  └───────────────────────────────────────────────────────────────┘
      ↓
◇ User action?
      │
      ├─ [View Diff] → [Diff View Modal]
      │                      ↓
      │                [Review diffs]
      │                      ↓
      │                (return to completion)
      │
      ├─ [Revert Tool Call] → [3-way merge → apply to disk]
      │                             ↓
      │                       [Refresh git status]
      │                             ↓
      │                       [Re-run verification]
      │                             ↓
      │                       (return to completion)
      │                       NOTE: Workflow state unchanged
      │
      ├─ [Rewind to Step] → [Select step to rewind to]
      │                           ↓
      │                     [Confirmation: "Revert N files, discard later outputs"]
      │                           ↓
      │                     [Bulk revert, reset workflow state]
      │                           ↓
      │                     [Session now shows step as current]
      │
      └─ [New Workflow] → [Empty State / Workflow Selection]
                                ↓
                           → Flow 1 or 2
```

### File Changes on Completion

After workflow completion, the **File Changes** section shows all file-modifying tool calls in reverse chronological order.

| UI Element | Description |
|------------|-------------|
| Tool call count | Total number of file-modifying operations |
| Files modified | Total number of unique files touched |
| Call list | Reverse-chronological list of edit-mode calls |
| Per-call [Revert] | Revert this call's file changes; shows "reverted" after |
| Per-call [Un-revert] | Re-apply a previously reverted call via reverse merge |

**Important**: Revert is a file-only operation. The workflow state (step outputs, session data) remains unchanged. Use **Rewind** if you want to go back to an earlier step and continue from there.

After revert: git status refreshes, verification re-runs, the call shows as "reverted" (can un-revert).

### Verification Checks

| Check | Pass | Fail Action |
|-------|------|-------------|
| TypeScript | Compiles clean | Show errors, block continue |
| ESLint | No violations | Show warnings, allow continue |
| Unit Tests | All pass | Show failures, block continue |
| Security | No issues | Show warnings, require ack |

### Edge Cases
- Verification fails: Show details, offer "Fix Issues" action
- No git changes: Hide git section, show "No files modified"
- Large diff: Paginate or collapse in View Diff
- Revert after verification: Re-runs all verification checks
- Revert all calls: Shows "No files modified" in git status
- Un-revert: Re-applies a reverted edit via reverse merge
- Rewind from completion: Returns to that step, can edit outputs and re-execute

---

## Flow 5: Error Recovery

**Entry**: Pipeline step failed during execution
**Goal**: Diagnose and recover from the error

```
[Error State]
      │
      │  ● RESEARCH ──[Rewind]── ● PLAN ──[Rewind]── ○ EXECUTE
      │                                               [error]
      │
      │  ┌───────────────────────────────────────────────────────────────┐
      │  │  3  EXECUTE                                         [error]   │
      │  │                                                               │
      │  │  > WriteFile src/auth/errors.ts                      [done]   │
      │  │    [Revert]                                                   │
      │  │  v Bash npm run typecheck                           [error]   │
      │  │    │ WHY: Running type check...                               │
      │  │    │ Input: npm run typecheck                                 │
      │  │                                                               │
      │  │  ┌─────────────────────────────────────────────────────────┐  │
      │  │  │ [!] EXECUTION FAILED                                    │  │
      │  │  │                                                         │  │
      │  │  │ src/auth/index.ts:42:15                                 │  │
      │  │  │ error TS2345: Argument of type 'string' is not          │  │
      │  │  │ assignable to parameter of type 'AuthError'.            │  │
      │  │  │                                                         │  │
      │  │  │ [Show more]                                             │  │
      │  │  └─────────────────────────────────────────────────────────┘  │
      │  │                                                               │
      │  │  [Retry]  [Revert File Changes]  [Rewind to PLAN]            │
      │  └───────────────────────────────────────────────────────────────┘
      │
      │  GLOBAL INPUTS                                       [Edit & Fork]
      │  task: "Refactor authentication"
      ↓
◇ Recovery action?
      │
      ├─ [Retry] → Re-run failed step with same context (fresh LLM call)
      │                   ↓
      │             ◇ Succeeds?
      │                   ├─ Yes → Continue execution
      │                   └─ No  → (back to error state)
      │
      ├─ [Revert File Changes] → [Select tool call to revert]
      │                                ↓
      │                          [3-way merge → apply to disk]
      │                                ↓
      │                          [Files changed, workflow state unchanged]
      │                                ↓
      │                          ◇ Next action?
      │                                ├─ [Retry] → Retry (LLM unaware of revert)
      │                                └─ [Rewind] → Rewind (clean slate)
      │
      ├─ [Rewind to PLAN] → [Confirmation: "Revert all EXECUTE files, discard outputs"]
      │                           ↓
      │                     [Bulk revert all EXECUTE tool calls]
      │                           ↓
      │                     [Reset workflow state to post-PLAN]
      │                           ↓
      │                     [Can edit PLAN outputs before continuing]
      │                           ↓
      │                     → Flow 3 (from PLAN completion)
      │
      ├─ [Edit & Fork] → [Edit global inputs or step outputs]
      │                        ↓
      │                  [Create forked session]
      │                        ↓
      │                  [Continue from edited point]
      │                        ↓
      │                  → Flow 3 (from fork point)
      │
      └─ [End Session] → [Session Closed]
                              (status set to "ended")
```

### Error Information Displayed

| Field | Description |
|-------|-------------|
| Failed Step | Which pipeline step failed |
| WHY | Agent's reasoning for the action |
| Input | The actual command/operation attempted |
| Error Output | Full error message from tool |
| File:Line | Location if applicable |

### Recovery Strategies

| Action | What it does | LLM Awareness |
|--------|--------------|---------------|
| Retry | Re-run step with fresh LLM context | Fresh context, no memory of failure |
| Revert | Undo specific file changes via 3-way merge | None — LLM context unchanged |
| Rewind | Bulk revert + reset workflow state | None — fresh context on resume |
| Edit & Fork | Edit I/O, create forked session | None — fresh context with edited data |

**Key insight**: The LLM is NEVER "informed" of reverts or errors from previous attempts. Each retry/resume is a fresh context. The LLM only sees its configured inputs, not the history of failures.

> To abandon the workflow entirely, close the session tab or use "End Session" in the session header.

### Edge Cases
- Multiple consecutive failures: Suggest "Rewind to PLAN" prominently
- Revert the failed call itself: Reverts partial effects of the failed tool call
- Revert + retry: LLM retries unaware of file revert (may hit same issue)
- Revert + rewind: Clean slate with reverted files as baseline

---

## Flow 6: Workflow History

**Entry**: User wants to review or replay past workflows
**Goal**: Find, review, and optionally replay previous work
**Scope**: Per-project by default (powered by GoatDB session registry)

```
[History View]
      │
      │  ┌──────────────┬──────────────────────────────────────────────┐
      │  │  PROJECTS    │  Tabs: [Refactor Auth] [History] [+]         │
      │  │              ├──────────────────────────────────────────────┤
      │  │  ● my-api    │                                              │
      │  │    main      │  WORKFLOW HISTORY — my-api                   │
      │  │              │                                              │
      │  │  ○ frontend  │  [Search...______] [This Project ▾]          │
      │  │    feature/x │                                              │
      │  │              │  14:32  Refactor authentication  [done]      │
      │  │  [+ Open]    │    │    Duration: 03:42  Files: 4  Calls: 3  │
      │  │              │    │    [Replay]  [View Edits]               │
      │  │              │  ───────────────────────────────────────     │
      │  │              │  11:15  Fix bug #42 - null ptr   [done]      │
      │  │              │  Yesterday  Add user profile    [error]      │
      │  │              │  Jan 24  Refactor database       [done]      │
      │  │              │                                              │
      │  │              │       [New Workflow]  [Export History]       │
      │  │              │                                              │
      │  │              │  Status: 4 workflows | 3 completed | 1 error │
      │  └──────────────┴──────────────────────────────────────────────┘
      ↓
◇ User action?
      │
      ├─ [Search] → Filter list by keyword
      │
      ├─ [Project Filter ▾] → Toggle between:
      │                       • This Project (default)
      │                       • All Projects
      │
      ├─ [Click Workflow] → Expand details
      │                          │
      │                          │  Shows: duration, files, status
      │                          ↓
      │                    ◇ Sub-action?
      │                          │
      │                          ├─ [Replay] → [Workflow Selection]
      │                          │                  (pre-filled)
      │                          │                      ↓
      │                          │                 → Flow 2
      │                          │
      │                          ├─ [View Edits] → [Read-only Session Edit Log]
      │                          │                       ↓
      │                          │                 [Browse tool calls with
      │                          │                  file changes and revert state]
      │                          │                       ↓
      │                          │                 (return to history)
      │                          │
      │                          └─ [View] → [Read-only Session]
      │
      ├─ [Export History] → [Download JSON/CSV]
      │                     (includes project path in export)
      │
      └─ [New Workflow] → → Flow 1
```

### History Entry Fields

| Field | Description |
|-------|-------------|
| Timestamp | When workflow ran |
| Title | Task description (truncated) |
| Status | done / error / ended |
| Duration | Total execution time |
| Files | Number of files modified |
| Tool Calls | Number of file-modifying operations |
| Project | (only in "All Projects" view) |

### History Storage

| Location | Contents |
|----------|----------|
| `.smith/db/registry/` | GoatDB session registry (this project's metadata) |
| `.smith/db/sessions/` | GoatDB session repos (GC'd after finalization) |
| `~/.smith/history/` | Index of all projects (for "All Projects" view) |

### Edge Cases
- Empty history: Show "No workflows yet" with CTA
- Many entries: Paginate or virtual scroll
- Search no results: Show "No matches" with clear button
- "All Projects" with deleted project: Show path, mark as unavailable
- GC'd session: Shows metadata only (tool call details no longer available)
- View edits on active session: Redirects to the active session tab

---

## Flow 7: Multi-Session Management

**Entry**: User working on multiple concurrent tasks across projects
**Goal**: Switch between projects and manage workflow sessions
**Model**: Project Sidebar (left) + Workflow Tabs (top of main area)

```
┌──────────────┬──────────────────────────────────────────────┐
│  PROJECTS    │  Tabs: [Refactor auth] [Fix #42] [+]         │
│              ├──────────────────────────────────────────────┤
│  ● my-api    │                                              │
│    main    ◉ │  ● RESEARCH ──── ○ PLAN ──── ○ EXECUTE       │
│              │                                              │
│  ○ backend   │  [Workflow content...]                       │
│    develop   │                                              │
│              │                                              │
│  [+ Open]    │  ◉ = workflow running                        │
└──────────────┴──────────────────────────────────────────────┘
      │                           │
      ↓                           ↓
◇ Sidebar action?           ◇ Tab action?
      │                           │
      ├─ [Click Project]          ├─ [Click Tab]
      │        │                  │        │
      │        │  Switches to     │        │  Switches to that
      │        │  that project    │        │  workflow session
      │        ↓                  │        ↓
      │  [Load Project's Tabs]    │  [Session Screen]
      │                           │
      ├─ [+ Open]                 ├─ [Click + Tab]
      │        │                  │        │
      │        ↓                  │        ↓
      │  → Flow 0 (open project)  │  → Flow 2 (new workflow)
      │                           │
      └─ [Close Project]          ├─ [Middle-Click Tab]
               │                  │        │
               ↓                  │        ↓
         ◇ Workflows running?     │  ◇ Unsaved work?
               │                  │        │
               ├─ Yes → Confirm   │        ├─ Yes → [Confirm Dialog]
               │        dialog    │        │              │
               │                  │        │              ├─ Save → save
               └─ No → Close      │        │              ├─ Discard → close
                       project    │        │              └─ Cancel → keep
                                  │        │
                                  │        └─ No → [Tab Closed]
                                  │
                                  └─ [Drag Tab] → Reorder tabs
```

### Project Sidebar

The sidebar shows only **open** projects — those with active GoatDB sync. All projects in the sidebar are initialized by definition.

| Element | Description |
|---------|-------------|
| Active indicator (●) | Currently viewed project |
| Branch name | Git branch (if git repo) |
| Running indicator (◉) | Shows if any workflow is executing |
| [+ Open] | Opens Flow 0 to open another project |

### Project Switching Behavior
- Click project in sidebar → Loads that project's workspace and tabs
- Each project maintains its own set of workflow tabs
- Switching projects preserves tab state in both projects

### Closing a Project
- Closes all workflow tabs for that project
- Removes project from sidebar
- Deactivates GoatDB sync for that project
- Project remains in recent list and can be reopened later

### Tab States

| State | Visual Indicator |
|-------|------------------|
| Active | Highlighted, full opacity |
| Background | Dimmed |
| Running | Spinner or progress dot |
| Error | Red indicator |
| Complete | Green checkmark |

### Session Persistence
- Sessions auto-save state to local storage
- Closing browser: All open projects and their tabs restored on reopen
- Closing last workflow tab: Returns to workspace empty state (stays in project)
- Closing project: Confirms if workflows running, removes all tabs, deactivates GoatDB sync

### Sidebar Behavior
- Sidebar is collapsible for more screen space
- Badge on project shows: branch + running workflow count
- Projects sorted by most recently accessed

---

## Flow 8: Settings

**Entry**: User clicks `[*]` button in tab bar
**Goal**: View/modify configuration, check provider status

```
[Any Workspace State]
      │
      │  Click [*] in tab bar
      ↓
[Settings Modal]
      │
      │  Provider list rendered from adapter registry.
      │  Any installed adapter shows up automatically.
      │
      │  ┌─────────────────────────────────────────┐
      │  │  SETTINGS                          [X]  │
      │  │                                         │
      │  │  PROVIDERS                              │
      │  │                                         │
      │  │  [*] OpenAI (built-in)   [available]    │
      │  │      gpt-4o, gpt-4o-mini, o1, o1-mini  │
      │  │                                         │
      │  │  [+ Add Provider]                       │
      │  │                                         │
      │  │  TOOLS                                  │
      │  │                                         │
      │  │  [*] read         @smith/tool-read      │
      │  │  [*] write        @smith/tool-write     │
      │  │  [*] glob         @smith/tool-glob      │
      │  │  [*] grep         @smith/tool-grep      │
      │  │  [*] bash         @smith/tool-bash      │
      │  │  [*] mcp          @smith/tool-mcp       │
      │  │                                         │
      │  │  [+ Add Tool]                           │
      │  │                                         │
      │  │  DEFAULT MODEL                          │
      │  │  [openai:gpt-4o__________________|v]    │
      │  │                                         │
      │  │  [+ Advanced Options]                   │
      │  │    Max Tokens: [8192____]               │
      │  │    Temperature: [1.0____]               │
      │  │                                         │
      │  │  MCP SERVERS (via @smith/tool-mcp)      │
      │  │  filesystem                 [running]   │
      │  │  database                   [stopped]   │
      │  │  [+ Add Server]                         │
      │  │                                         │
      │  │  Config:  ~/.smith/settings.json        │
      │  │  Project: .smith/settings.json          │
      │  │  Local:   .smith/settings.local.json    │
      │  │                                         │
      │  │                       [Close]           │
      │  └─────────────────────────────────────────┘
      │
      ├──────────────────────────────┐
      ↓                              ↓
[Change Default Model]        [Click Provider Row]
      │                              │
      │  Updates ~/.smith/           │  CLI: Shows login hint
      │  settings.json               │  API: Shows env var to set
      │  (or project/local override) │
      ↓                              ↓
[Model Updated]               [Info Toast]
      │                              │
      └──────────────────────────────┘
                   │
                   ↓
            [Click Close / [X]]
                   │
                   ↓
            [Return to Previous State]
```

### Settings Display

| Section | Content | Editable |
|---------|---------|----------|
| Providers | Registry-driven list with adapter-reported status and hints | No (shows adapter hints) |
| Add Provider | Opens docs/config guidance for installing adapter packages | N/A |
| Tools | Registry-driven list of bundled and user-installed tools | No (shows tool packages) |
| Add Tool | Opens docs for installing tool packages | N/A |
| Default Model | Dropdown with `provider:model` format | Yes |
| Advanced Options | maxTokens, temperature | Yes |
| MCP Servers | List from `mcp.servers` config (via `@smith/tool-mcp`) | No (link to add) |
| Config Paths | Links to open in editor | No |
| Local Overrides | Values from settings.local.json | Yes (creates file on save) |

### Provider Status

Each adapter reports its own status and hint text. Common patterns:

| Status | Display | Meaning |
|--------|---------|---------|
| Available | `[available]` + model list | Adapter ready to accept requests |
| Unavailable | `[unavailable]` + hint | Adapter cannot connect; hint is adapter-specific (e.g., "OpenAI OAuth login required", "check baseUrl", "adapter not installed") |

### Edge Cases
- No providers configured: Show prominent warning, link to docs with `[+ Add Provider]`
- Adapter runtime failure: Show adapter-reported error and hint
- Model dropdown empty: Disable, show "No models available"
- Settings file error: Show error, offer to reset
- Project has override: Show "Project: ..." indicator on changed values
- No local settings file: Show "Create local override" link; on first save, the file is created
- Changing default model: Writes to `~/.smith/settings.json` (user-level) by default. A "Save as project override" or "Save as local override" option scopes the write to `.smith/settings.json` or `.smith/settings.local.json` respectively

---

## State Transition Summary

```
                    ┌──────────────┐
                    │  App Launch  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
          ┌────────│   Project    │←───────────────────────────┐
          │        │   Browser    │                            │
          │        └──────┬───────┘                            │
          │               ↓                                    │
          │        ◇ .smith/ valid?                            │
          │               │                                    │
          │        ┌──────┴──────┐                             │
          │        ↓             ↓                             │
          │   [Initialize]  [Open Project]                     │
          │        │             │                             │
          │        └──────┬──────┘                             │
          │               ↓                                    │
          │        ┌──────────────┐                            │
          │   ┌───→│   Project    │←──┐                        │
          │   │    │    Open      │   │                        │
          │   │    └──────┬───────┘   │                        │
          │   │           ↓           │ switch                 │
          │   │    ┌──────────────┐   │ project                │
          │   │    │  Workspace   │───┘                        │
          │   └────│ Empty State  │←────────────────────┐      │
          │ close  └──────┬───────┘                     │      │
          │ project       ↓                             │      │
          │        ┌──────────────┐                     │      │
          │        │  Workflow    │                     │      │
          │        │  Selection   │                     │      │
          │        └──────┬───────┘                     │      │
          │               ↓                             │      │
          │        ┌──────────────┐                     │      │
          │   ┌───→│   Active     │←──────────┐        │      │
          │   │    │   Session    │           │        │      │
          │   │    └──────┬───────┘           │        │      │
          │   │           ↓                   │ fork   │      │
          │   │    ┌─────────────┐            │        │      │
          │   │    │  Step N     │────────────┤        │      │
          │   │    └──────┬──────┘  edit I/O  │        │      │
          │   │           ↓                   │        │      │
          │   │    ┌─────────────┐            │        │      │
          │   └────│  Step N+1   │────────────┘        │      │
          │ rewind └──────┬──────┘                     │      │
          │               ↓                            │      │
          │        ┌─────────────┐                     │      │
          │        │  Execute    │                     │      │
          │        │  (edits)    │                     │      │
          │        └──────┬──────┘                     │      │
          │               │                            │      │
          │               │  revert = file only        │      │
          │               │  (workflow unaware)        │      │
          │               ↓                            │      │
          │        ◇ Success?                          │      │
          │        ├─ Yes ──→ ┌──────────────┐         │      │
          │        │          │  Completed   │─────────┘      │
          │        │          └──────────────┘ new workflow   │
          │        │                    │                     │
          │        │                    └─────────────────────┘
          │        │                         switch project
          │        └─ No  ──→ ┌──────────────┐
          │                   │ Error State  │
          │                   └──────┬───────┘
          │                          │
          └──────────────────────────┘
                   retry / rewind

                   ┌──────────────┐
                   │ Forked       │  (new session from fork point)
                   │ Session      │
                   └──────────────┘
```

### Key State Transitions

| From | To | Trigger |
|------|----|---------|
| App Launch | Welcome (Flow -1) | First launch (no ~/.smith/) |
| App Launch | Project Browser | Has ~/.smith/ |
| Welcome | Project Browser | Click "Get Started" |
| Project Browser | Initialize Modal | Open folder without valid .smith/ |
| Initialize Modal | Project Open | Click "Initialize" |
| Initialize Modal | Project Browser | Click "Cancel" |
| Project Browser | Project Open | Open initialized folder or click recent |
| Project Open | Workspace Empty | Initial state, or close last tab |
| Workspace Empty | Workflow Selection | Select workflow |
| Workflow Selection | Active Session | Start workflow |
| Any workspace state | Different project | Click in sidebar |
| Any project state | Project Browser | Close project |
| Any step | Forked Session | Edit completed step's I/O |
| Active Session | Earlier Step | Rewind (bulk revert + state reset) |
| Execute | Execute (unchanged) | Revert file changes (workflow unaware) |
| Completed | Completed (unchanged) | Revert file changes (workflow unaware) |
| Completed | Earlier Step | Rewind (bulk revert + state reset) |
| Error State | Earlier Step | Rewind (bulk revert + state reset) |
| Error State | Active Session | Retry (fresh LLM context) |
| Any state | Settings Modal | Click [*] button |
| Settings Modal | Previous state | Click Close |

### Key Distinctions

| Operation | Scope | Workflow State | LLM Awareness |
|-----------|-------|----------------|---------------|
| **Revert** | Single tool call's files | Unchanged | None |
| **Rewind** | All files from later steps | Reset to target step | None (fresh context) |
| **Fork** | Creates new session branch | New session from fork point | None (fresh context) |
