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
pnpm build            # wxt zip: .output/chrome-mv3 + .output/chrome-bypass-links-*.zip
pnpm dev              # Chrome dev server with hot reload (.output/chrome-mv3-dev)

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
- **packages/shared** - Shared React components, types, utilities, SWR keys, and zod schemas
- **packages/ui** - Shared UI components using shadcn/ui Base UI + Tailwind CSS
- **packages/configs** - Shared tsconfig, root `.env` loader (`env.ts`), and Firebase client config
- **packages/trpc** - tRPC router with Firebase backend (type-safe API)

## Build System and CI

Turbo's `build` task depends on `//#lint:ci` and `//#typecheck` in `turbo.json`. The root `typecheck` covers root files only; workspace typechecks run through `pnpm typecheck:all`. `packages/ui` is excluded from oxlint and oxfmt and has no `typecheck` script.

- `build.yml` (branch pushes): `pnpm build` only. **PR CI does not run E2E.**
- `release.yml` (main): preview deploy → E2E → production deploy
- `playwright.yml`: manual E2E run. Use `gh workflow run playwright.yml --ref <branch>` before merging changes to specs, fixtures, or tested behavior.

## E2E Testing

Playwright projects:

1. **auth-setup** (`apps/*/tests/auth.setup.ts`) - Prepares web `storageState` and an authenticated extension Chrome profile under `.playwright/.cache`
2. **@bypass/web-with-auth** (`apps/web/tests/specs/`) - Web specs, authenticated via the project's `storageState`
3. **@bypass/extension** (`apps/extension/tests/specs/`) - Parallel extension tests, each worker on a copy of the cached Chrome profile

`tests/coverage-report.ts` is the global teardown: it writes the coverage report in CI and removes `.playwright/.cache`. Shared page-object bases live in `packages/shared/src/utils/test-poms.ts`. For local run prerequisites and extension test conventions, use the [E2E test generation skill](.agents/skills/e2e-test-generation/SKILL.md).

## Development Realtime Database

If the Firebase Realtime Database MCP server is available, use it to read data from `bypass-links-dev`. The server is read-only and may not be configured in every agent environment.

- Test User UID: `AEKnp40pKBfCaAZTW9WXlv8UP1v2`
- Development User UID: `pZyBOYAMTzgyNw0286WjQTOuKb52`

## Key Technologies

- **React Compiler**: Enabled in both apps (`reactCompiler: true` in web, `reactCompilerPreset()` in extension); enforced by the `react/react-compiler` oxlint rule — avoid manual `useMemo`/`useCallback` unless needed
- **UI**: shadcn/ui (Base UI) via `packages/ui` and `@bypass/ui`
- **Styling**: Tailwind CSS v4
- **Icons**: Hugeicons (`@hugeicons/core-free-icons`, `@hugeicons/react`)
- **Forms**: TanStack React Form + zod/mini validation
- **State**: WXT storage for persisted extension state; Zustand for ephemeral UI state; SWR for remote data
- **API**: tRPC for type-safe client-server communication
- **Backend**: Firebase with Admin SDK
- **Linting**: oxlint (type-aware via oxlint-tsgolint), config in `.oxlintrc.json`; `correctness`, `suspicious`, and `perf` are errors (e.g. unsafe type assertions)
- **Formatting**: oxfmt, config in `.oxfmtrc.json`
- **Lint JS plugins**: `oxlint-tailwindcss` and `@shadcn/lint`
- **TypeScript**: v7 (native). Run tools with `pnpm exec`; `npx` fails because `devEngines` blocks npm

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

`pnpm update:shadcn` (root) re-adds every component with overwrite, which drops manual customizations. Review the diff and restore them afterwards.

## Development Guidelines

- Ask any questions instead of assuming things when in plan mode
- Never automatically commit or push changes unless explicitly asked

## Specialized Skills

- Domain-specific agent skills live in `.agents/skills/`. Read a relevant skill when the task calls for it.

## Post-Change Verification

Always after making code changes, run the following commands (for docs-only changes, `pnpm format:check` is enough):

```bash
pnpm lint
pnpm format:check
pnpm typecheck:all
```

Optionally, run E2E tests only when the user explicitly asks, or when the changes affect behavior covered by E2E tests:

```bash
pnpm e2e <relative-filepath>
```
