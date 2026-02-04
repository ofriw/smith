# S.M.I.T.H UX/UI Specification

This document defines the user experience principles and patterns that guide SMITH's interface design. It serves as a reference for all UI implementation decisions.

---

## Core Philosophy

SMITH is a **pipeline-first** coding agent. The UI exists to make the structured workflow visible, inspectable, and editable. Every design decision flows from this principle.

### What SMITH Is

- A visual representation of a structured pipeline
- An inspector for step inputs, outputs, and transformations
- An editor for structured data at rest (when paused)
- A seamlessly synced experience across devices and users

### What SMITH Is Not

- A chat interface
- A log viewer with a sidebar
- A dashboard with separate panels for different concerns
- A collaborative editor with cursors and presence indicators

### The Fundamental Rule

> **The pipeline IS the UI. Steps are not metadata about the UI—they ARE the interface.**

This means:
- Steps should occupy primary visual real estate
- Tool calls are implementation details nested within steps
- Inputs and outputs are the user's primary focus, not LLM reasoning

---

## Design Principles

### 1. Pipeline as Primary Structure

The workflow pipeline defines the visual hierarchy. Users see:

```
STEP 1: RESEARCH
  └─ Input → Processing → Output

STEP 2: PLAN
  └─ Input → Processing → Output

STEP 3: EXECUTE
  └─ Input → Processing → Output
```

Not:

```
[Breadcrumb: Step 1 → Step 2 → Step 3]
┌─────────────┬─────────────┐
│ Data Panel  │ Log Panel   │
└─────────────┴─────────────┘
```

**Rationale**: The breadcrumb-plus-panels pattern treats the pipeline as navigation metadata. SMITH's value proposition is the pipeline itself—it should be the content, not the chrome.

### 2. Progressive Disclosure

Show what matters. Hide what doesn't. Let users dig deeper on demand.

**Default visibility by priority:**

| Element | Default State | Why |
|---------|---------------|-----|
| Step status | Always visible | Users need orientation |
| Step output | Expanded | Primary user concern |
| Step input | Collapsed | Usually derived, rarely edited |
| Tool calls | Collapsed | Implementation detail |
| Tool call details | Collapsed | Only needed for debugging |

**Disclosure triggers:**
- Click/tap to expand collapsed sections
- Sections remember their state within a session
- Active step auto-expands its tool calls (user is watching execution)

**Anti-patterns to avoid:**
- Hiding critical information behind hover states (mobile-hostile)
- Requiring navigation to see related data (context loss)
- Modal dialogs for content that could be inline (flow interruption)

### 3. In-Place Editing

Everything editable should be editable in place. No mode switches. No separate "edit screens."

**Pattern:**
```
┌─────────────────────────────────────────┐
│ findings: "The auth module has..."      │
│                              [Edit]     │
└─────────────────────────────────────────┘
         ↓ click Edit
┌─────────────────────────────────────────┐
│ findings:                               │
│ ┌─────────────────────────────────────┐ │
│ │ The auth module has...              │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                    [Cancel] [Save]      │
└─────────────────────────────────────────┘
```

**Not:**
```
[Edit] → Opens modal → Edit in modal → Close modal → See result
```

**Rationale**: Modal dialogs break flow and hide context. In-place editing keeps the user oriented within the pipeline.

### 4. IDE-Inspired Patterns

SMITH targets developers. Leverage familiar IDE patterns:

| IDE Pattern | SMITH Application |
|-------------|-------------------|
| Outline view | Step list with expand/collapse |
| Code folding | Section collapse (Input, Calls, Output) |
| Inline errors | Error badges on steps, expandable details |
| Sticky headers | Step header stays visible while scrolling content |
| Keyboard navigation | Tab through steps, Enter to expand |

**Visual language:**
- Monospace for data values
- Chevrons (▶/▼) for expand/collapse
- Indentation indicates nesting depth
- Status dots for state (●/◉/○)

### 5. Density Over Sprawl

Maximize information density without clutter. Developers prefer seeing more at once over pretty whitespace.

**Do:**
- Compact spacing between elements
- Truncate long values with "Show more"
- Use summary counts: "Tool Calls (3)" not three always-visible cards
- Single-line displays where possible

**Don't:**
- Card-heavy layouts with excessive padding
- Full-width elements that waste horizontal space
- Separate rows for label and value when inline works

**Example - Compact vs Sprawl:**

```
✓ Good: query: "Refactor authentication module"  scope: "src/auth/**"

✗ Bad:
┌──────────────────┐
│ Query            │
│ Refactor auth... │
├──────────────────┤
│ Scope            │
│ src/auth/**      │
└──────────────────┘
```

### 6. State-Driven Defaults

The UI should adapt based on workflow state without user configuration.

| Step Status | Input | Tool Calls | Output |
|-------------|-------|------------|--------|
| Pending | Collapsed | Collapsed | Collapsed |
| Active | Collapsed | **Expanded** | Streaming |
| Completed | Collapsed | Collapsed | **Expanded** |
| Error | Collapsed | **Expanded** | Expanded |

**Rationale:**
- Pending steps have no data yet—collapse to save space
- Active steps: users watch tool calls execute
- Completed steps: users care about the output, not how it was made
- Error steps: users need to see what failed

---

## Layout Structure

### Vertical Stack (Primary Pattern)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Global Inputs Bar (collapsible)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ STEP 1 ───────────────────────────────────────────────────┐│
│  │ Header: Name, Status, Metrics                              ││
│  │ ▶ Input                                                    ││
│  │ ▶ Tool Calls (N)                                           ││
│  │ ▼ Output                                                   ││
│  │   [content]                                                ││
│  └────────────────────────────────────────────────────────────┘│
│                           │                                     │
│                           ▼                                     │
│  ┌─ STEP 2 ───────────────────────────────────────────────────┐│
│  │ ...                                                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER: Execution Controls                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Why Not Two Columns?

The two-column pattern (content + sidebar) implies two separate concerns. In SMITH:
- Tool calls are not separate from steps—they're nested within
- IO data is not separate from execution—it's the input/output of each step

Separating them spatially breaks the mental model.

### Component Nesting

```
SessionView
├── GlobalInputsBar
├── StepList
│   ├── StepCard
│   │   ├── StepHeader (status, name, metrics)
│   │   ├── StepSection: Input
│   │   │   └── DataView
│   │   ├── StepSection: Tool Calls
│   │   │   └── ToolCallCard[]
│   │   │       ├── ToolCallHeader
│   │   │       └── ToolCallDetails (input, output)
│   │   └── StepSection: Output
│   │       └── DataView
│   └── StepConnector (visual line between steps)
└── ExecutionControls
```

---

## Responsive Behavior

SMITH works on laptop, tablet, and mobile. The same mental model applies everywhere—only density changes.

### Breakpoints

| Width | Classification | Behavior |
|-------|----------------|----------|
| ≥1024px | Desktop | Full density, all steps visible |
| 768-1023px | Tablet | Touch targets, same structure |
| <768px | Mobile | Single column, more aggressive collapse |

### Adaptation Strategy

**Same structure, different defaults:**

| Breakpoint | Steps | Sections | Touch |
|------------|-------|----------|-------|
| Desktop | All visible | Per-status defaults | No |
| Tablet | All visible | Per-status defaults | Yes (44px targets) |
| Mobile | All visible | Only active expanded | Yes (44px targets) |

**Not:** Different layouts per breakpoint. The user should recognize the same interface on any device.

### Touch Considerations

- Minimum tap target: 44×44px
- Accordion headers: full-width tap area
- Action buttons: adequate spacing
- No hover-only interactions

---

## Collaboration Model

SMITH supports real-time sync across devices and users through GoatDB. The collaboration model is intentionally lightweight—optimized for handoff and discussion, not simultaneous co-editing.

### Philosophy: Effortless Sync

Collaboration should be invisible. Users don't "enable sharing" or "invite collaborators." They simply:

1. Open the same workflow URL on another device
2. Share the URL with a colleague
3. See the same state, make changes, changes appear everywhere

**GoatDB handles everything.** Conflict-free sync happens automatically. No merge dialogs. No "someone else is editing" warnings. The UI doesn't need collaboration-specific chrome.

### Use Cases

| Scenario | What Happens |
|----------|--------------|
| **Device handoff** | Start on laptop, continue on tablet. Same state, instant. |
| **Show a colleague** | Share URL. They see exactly what you see. |
| **Discuss a workflow** | Both looking at same step. Point and talk. |
| **Hand off work** | Send URL. Colleague picks up where you left off. |
| **Review together** | Walk through completed steps. Expand sections as needed. |

### What Collaboration Is NOT

SMITH is a coding agent, not a collaborative document editor. We explicitly avoid:

| Feature | Why Not |
|---------|---------|
| Cursor tracking | Adds visual noise; workflows are typically single-viewer |
| "Alice is viewing..." indicators | Implies surveillance; unnecessary for handoff use case |
| Edit locks | GoatDB merges conflict-free; locks add friction |
| View-only mode | Everything is always editable by everyone |
| Presence avatars on elements | Over-engineering for rare simultaneous use |

### Design Implications

**No collaboration UI required.** The absence of collaboration chrome IS the design:

- No "Share" button (URLs are shareable by default)
- No user avatars on steps or fields
- No "N users viewing" counter
- No edit/view mode toggle

**State just syncs.** When someone else makes a change:

- UI updates reactively (GoatDB subscription)
- No toast notifications ("Alice edited...")
- No visual diff highlighting
- Change simply appears as if you made it

**Conflict resolution is invisible.** GoatDB's 3-way merge means:

- Two users can edit different fields simultaneously
- Two users editing the same field: last write wins (acceptable for rare case)
- No merge conflict dialogs ever

### The "Same Tab, Different Device" Mental Model

Users should think of SMITH sessions like a single browser tab that happens to be open on multiple screens. Not like Google Docs with multiple cursors—like having your browser synced across devices.

```
┌─────────────────┐     ┌─────────────────┐
│ Laptop          │     │ Tablet          │
│                 │     │                 │
│ [Same workflow] │ ←─→ │ [Same workflow] │
│ [Same state]    │     │ [Same state]    │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
        ↑                       ↑
        └───────────────────────┘
              GoatDB Sync
         (invisible to user)
```

### Edge Cases

| Situation | Behavior |
|-----------|----------|
| Offline edits | Queued, synced when online (GoatDB handles) |
| Simultaneous rewind | Both see rewind result; no conflict |
| One user pauses, other continues | Pause state syncs; both see paused |
| Stale tab reconnects | Catches up silently; no "refresh needed" |

### Implementation Notes

- Subscribe to GoatDB session on mount
- Re-render on any state change (local or remote)
- No differentiation between "my change" and "their change"
- Execution controls (pause/continue) sync like any other state

---

## Interaction Patterns

### Expand/Collapse

**Trigger:** Click anywhere on section header
**Visual:** Chevron rotates (▶ → ▼)
**Animation:** CSS transition, 150ms ease-out
**State:** Remembered within session, reset on new session

### Edit Mode

**Trigger:** Click [Edit] button within section
**Transition:** Inline expansion to form/textarea
**Actions:** [Cancel] reverts, [Save] commits and collapses
**Scope:** One field at a time (not full-step edit mode)

### Revert (Tool Calls)

**Trigger:** [Revert] button on completed tool call
**Effect:** Immediately applies 3-way merge to disk
**Visual:** Badge changes to "Reverted", [Revert] becomes [Un-revert]
**No confirmation:** Action is reversible, keep it fast

### Rewind (Steps)

**Trigger:** [Rewind] button on step header
**Effect:** Confirms, then bulk-reverts all subsequent steps
**Confirmation:** Required (destructive to workflow state)
**Visual:** Steps after target become "pending" again

---

## Visual Hierarchy

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| ○ | Pending |
| ◉ | Active (running) |
| ● | Completed |
| ⚠ | Error |

### Typography Scale

| Element | Style |
|---------|-------|
| Step name | Bold, larger |
| Section title | Medium weight |
| Field keys | Monospace, muted color |
| Field values | Monospace, default color |
| Metadata (time, tokens) | Small, muted |

### Color Usage

- **Status colors:** Applied to dots and badges only, not backgrounds
- **Accent:** Used sparingly for active/focus states
- **Borders:** Distinguish step cards, not individual fields
- **Background:** Minimal variation; avoid "zebra striping"

---

## Anti-Patterns

### Avoid These

| Anti-Pattern | Why It's Wrong | Instead |
|--------------|----------------|---------|
| Full-screen modals for editing | Loses context | In-place editing |
| Separate "detail view" for steps | Navigation overhead | Expand in place |
| Hover-only information | Mobile-hostile | Always visible or tap-to-reveal |
| Tabs within steps | Hides related data | Accordions (all visible when expanded) |
| Horizontal step layout | Doesn't scale, wastes vertical space | Vertical stack |
| Separate timeline panel | Implies tool calls are primary | Nested within steps |

### The "Dashboard Trap"

Dashboards arrange independent widgets. SMITH's data is not independent—it's a pipeline where each step's output feeds the next step's input.

Dashboard thinking leads to:
- Panels that could be rearranged (but shouldn't be)
- Equal visual weight to unequal concerns
- Lost sense of flow and sequence

Pipeline thinking leads to:
- Fixed vertical sequence
- Clear parent-child relationships
- Data flow visualization

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus to next interactive element |
| Enter | Expand/collapse focused section, activate button |
| Escape | Cancel edit mode, close expanded details |
| ↑/↓ | Navigate between steps (when step list focused) |

Focus management:
- Focus ring visible on all interactive elements
- After expand, focus moves into expanded content
- After collapse, focus returns to header

---

## Summary

SMITH's UI principles reduce to:

1. **Pipeline is the UI** — Steps are content, not navigation
2. **Progressive disclosure** — Show outputs, hide implementation
3. **In-place everything** — No modals, no separate screens
4. **IDE density** — Developers want information, not decoration
5. **State-driven defaults** — UI adapts to workflow phase
6. **Responsive sameness** — Same structure, all breakpoints
7. **Invisible collaboration** — Sync just works, no collaboration chrome
