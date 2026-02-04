You are an expert UX designer specializing in dev tools and complex systems.

Read `ux-spec.md` for UX and design specification and philosophy.

> **Project Phase**: Prototype/UI demo. Mock LLM and tools only. No real integrations.

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime | **Deno 2.x** | TypeScript-first, no Node.js/npm |
| Frontend | React 18 + wouter | JSX transform via `jsxImportSource: "react"` |
| Backend | GoatDB | Local file-based DB at `.smith/data` |
| Build | esbuild (via GoatDB) | CSS bundled separately |
| Styling | CSS Variables + BEM | Design tokens in `client/tokens/` |

## Development Commands

```bash
# Start dev server (hot reload, port auto-assigned)
deno task dev

# Type check all modules
deno task check

# Build standalone binary for current platform
deno task build

# Run tests (Deno built-in test runner)
deno task test
```

**Non-interactive execution notes:**
- All commands support `-A` (all permissions) for CI/automation
- No interactive prompts in any task
- Build outputs to `build/` directory

## Browser Automation

Always use `agent-browser` cli to verify and debug the app. Run `agent-browser --help` for all commands.

**Core workflow:**
Spawn a general purpose agent to use the `agent-browser` cli. Prompt it to:
1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes


## Coding Conventions

### TypeScript
- Strict mode enabled (`strict: true`)
- Explicit `.ts`/`.tsx` extensions in imports required
- Export types alongside components: `export type { ButtonProps }`
- Discriminated unions for status: `"idle" | "running" | "paused" | "completed" | "error"`

### React Components
```typescript
// Pattern: Function component with explicit types
export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // ...
};

export function Button({ variant = "primary", ...props }: ButtonProps) {
  // ...
}
```

### CSS & Styling
- **Never use primitive tokens directly** - use semantic tokens
- BEM naming: `.component`, `.component--modifier`, `.component__element`
- Colocate CSS with component: `Button.tsx` + `Button.css`
- Use `cn()` utility for conditional classes

```css
/* Good - semantic tokens */
.button { background: var(--accent-primary); }

/* Bad - primitive tokens */
.button { background: var(--blue-500); }
```

### State Management
- Always prefer to store state in GoatDB so it's reliably sync'ed across devices
- Apply GoatDB's `local` flag when state needs to stay ephemeral and skip sync

### File Naming
- Components: `PascalCase.tsx` with matching `.css`
- Utilities/hooks: `camelCase.ts`
- Index files re-export module contents
- Test files: `*_test.ts` (Deno convention)

## Critical Constraints

1. **GoatDB Local Dependency**: `deno.json` points to local GoatDB path. Agent cannot run builds without GoatDB installed at `/Users/ofri/Documents/GitHub/goatdb/`

2. **No Real LLM/Tools**: All execution uses `MockLLMProvider` and `MockToolExecutor`. Do not attempt real API calls.

3. **CSS Bundling Required**: Run `scripts/bundle-css.ts` before build (done automatically by `deno task build`)

4. **No npm/package.json**: This is a Deno project. Use JSR or npm: specifiers in `deno.json` imports.

5. **Type Extensions Required**: Always include `.ts`/`.tsx` in imports:
   ```typescript
   // Correct
   import { Button } from "./Button.tsx";

   // Wrong
   import { Button } from "./Button";
   ```

## Common Pitfalls

### Import Errors
- Missing `.ts`/`.tsx` extension → Module not found
- Using `@types/` packages → Check Deno docs for compatibility

### GoatDB Schema Errors
- Schemas must be registered in `common/schemas/mod.ts`
- Call `registerSchemas()` before app render (done in `app.tsx`)
