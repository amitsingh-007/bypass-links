# AGENTS.md

Repo-wide guidance for coding agents. Use [contributing.md](contributing.md) for local setup and `.agents/skills/` for task-specific workflows.

## Project Overview

Bypass Links is a desktop Chrome extension for bookmarks tagged with people, URL shortcuts, forum tools, history monitoring, and bypassing intermediary links on supported sites. The monorepo also contains its Next.js web app and shared backend code.

## Package Manager

Use Node.js 24 and pnpm 12. Workspaces use pnpm; Turbo runs cross-workspace tasks.

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start development servers
pnpm run env          # Pull Vercel variables to .env after linking the project

# Building (turbo orchestrates with dependency graph)
pnpm build            # Build all workspaces

# Extension-specific builds
cd apps/extension
pnpm build            # Build Chrome extension to .output/chrome-mv3
pnpm dev              # Chrome dev server with hot reload

# Code quality
pnpm lint             # Lint all files (oxlint, type-aware) with autofix
pnpm lint:ci          # Lint without autofix (CI)
pnpm format           # Format all files (oxfmt)
pnpm format:check     # Check formatting without writing
pnpm typecheck        # Type check root only
pnpm typecheck:all    # Type check all workspaces

# Testing
pnpm e2e              # Run Playwright E2E tests
pnpm e2e:report       # Open the HTML report
```

## Architecture

This is a **Turbo + pnpm monorepo** with the following structure:

- **apps/extension** - Browser extension (WXT, React, Wouter for routing)
- **apps/web** - Next.js download site and signed-in web interface
- **packages/shared** - Shared React components, types, utilities, and stores (Zustand)
- **packages/ui** - Shared UI components using shadcn/ui Base UI + Tailwind CSS
- **packages/configs** - Shared TypeScript and build configs
- **packages/trpc** - tRPC router with Firebase backend (type-safe API)

## Build System

Turbo's `build` task depends on `//#lint:ci` and `//#typecheck` in `turbo.json`.

## E2E Testing

Playwright projects:

1. **auth-setup** (`apps/*/tests/auth.setup.ts`) - Prepares web `storageState` and an authenticated extension Chrome profile under `.playwright/.cache`
2. **@bypass/web-with-auth** (`apps/web/tests/specs/`) - Web specs, authenticated via the project's `storageState`
3. **@bypass/extension** (`apps/extension/tests/specs/`) - Parallel extension tests, each worker on a copy of the cached Chrome profile

`tests/coverage-report.ts` is the global teardown: it writes the coverage report in CI and removes `.playwright/.cache`. Shared page-object bases live in `packages/shared/src/utils/test-poms.ts`. For extension test conventions, use the [E2E test generation skill](.agents/skills/e2e-test-generation/SKILL.md).

## Key Technologies

- **React Compiler**: Enabled in both apps (`reactCompiler: true` in web, `reactCompilerPreset()` in extension); enforced by the `react/react-compiler` oxlint rule — avoid manual `useMemo`/`useCallback` unless needed
- **UI**: shadcn/ui (Base UI) via `packages/ui` and `@bypass/ui`
- **Styling**: Tailwind CSS v4
- **Icons**: Hugeicons (`@hugeicons/core-free-icons`, `@hugeicons/react`)
- **Forms**: TanStack React Form + zod/mini validation
- **State**: Zustand
- **API**: tRPC for type-safe client-server communication
- **Backend**: Firebase with Admin SDK
- **Linting**: oxlint (type-aware via oxlint-tsgolint), config in `.oxlintrc.json`
- **Formatting**: oxfmt, config in `.oxfmtrc.json`
- **Tailwind linting**: `oxlint-tailwindcss` (native oxlint plugin)

## Code Patterns

- Use workspace protocol (`workspace:*`) for internal dependencies
- Shared types and utilities go in `packages/shared`
- tRPC procedures are defined in `packages/trpc`
- Minimize comments. Add one only when the code cannot express a necessary reason. Keep it short and explain why, not what the code does.

## shadcn/ui Components

shadcn/ui components are managed in the `packages/ui` workspace. This project uses the **Base UI** version of shadcn, not the Radix UI primitives.

For the latest shadcn documentation and component reference, see: https://ui.shadcn.com/llms.txt

```bash
# Add a new shadcn component
cd packages/ui
pnpm dlx shadcn@latest add [component-name]

# Example: add button component
pnpm dlx shadcn@latest add button
```

Do not modify existing files in `packages/ui` unless explicitly asked. Add requested new shared UI components there and export them from `packages/ui/src/index.ts`.

## Development Guidelines

- Ask any questions instead of assuming things when in plan mode
- Never automatically commit or push changes unless explicitly asked

## Specialized Skills

- Domain-specific agent skills live in `.agents/skills/`. Read a relevant skill when the task calls for it.

## Post-Change Verification

Always after making changes, run the following commands:

```bash
pnpm lint
pnpm format:check
pnpm typecheck:all
```

Optionally, run E2E tests only when the user explicitly asks, or when the changes affect behavior covered by E2E tests:

```bash
pnpm e2e <relative-filepath>
```
