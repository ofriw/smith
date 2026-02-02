# S.M.I.T.H

> Structured Multi-model Intelligent Task Handler

![Status: In Development](https://img.shields.io/badge/status-in%20development-yellow)

<!-- Screenshot placeholder -->
<!-- ![S.M.I.T.H Screenshot](docs/assets/screenshot.png) -->

## What is S.M.I.T.H?

S.M.I.T.H is an AI coding agent that runs structured pipelines instead of freeform chat. Define workflows in code, inspect step outputs, and control execution with pause/revert/rewind. Each step can use a different LLM optimized for its task.

## Quick Start

```bash
# Install (coming soon)
npm install -g @smith/cli

# Initialize a project
cd my-project
smith init

# Run a workflow
smith run plan-execute --task "Refactor the auth module"
```

## Documentation

- [User Guide](docs/USER-GUIDE.md) - How to use S.M.I.T.H
- [Architecture](docs/ARCHITECTURE.md) - How it works internally
- [Glossary](docs/GLOSSARY.md) - Term definitions

## Status

S.M.I.T.H is in active development. See the wireframes at `wireframes/` for UI mockups.
