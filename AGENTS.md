# AGENTS.md

This file provides guidance for coding agents working with this repository.

## Project Overview

Bypass Links is an open-source browser extension (Chrome) that bypasses intermediary links on various websites, avoiding reCaptchas, timers, ads, and pop-ups. It also includes utility features like history monitoring and bookmarks with person tagging.

## Package Manager

**pnpm** - This project uses pnpm for package management and workspace orchestration.

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start all dev servers
pnpm run env          # Pull Vercel environment variables to .env

# Building (turbo orchestrates with dependency graph)
pnpm build            # Build all workspaces

# Extension-specific builds
cd apps/extension
pnpm build            # Build Chrome extension to .output/chrome-mv3
pnpm dev              # Chrome dev server with hot reload

# Code Quality
pnpm lint             # Lint all files (XO linter)
pnpm typecheck        # Type check root only
pnpm typecheck:all    # Type check all workspaces

# Testing
pnpm e2e              # Run Playwright E2E tests
```

## Architecture

This is a **Turbo + pnpm monorepo** with the following structure:

- **apps/extension** - Browser extension (WXT, React with Preact, Wouter for routing)
- **apps/web** - Next.js web interface for downloads and admin
- **packages/shared** - Shared React components, types, utilities, and stores (Zustand)
- **packages/ui** - Shared UI components using shadcn/ui Base UI + Tailwind CSS
- **packages/configs** - Shared TypeScript, ESLint (XO), and build configs
- **packages/trpc** - tRPC router with Firebase backend (type-safe API)

## Build System

Turbo manages task dependencies defined in `turbo.json`:

- `build` tasks depend on `//#lint:ci` and `//#typecheck` completing first

## E2E Testing

Playwright tests use setup/teardown projects for both web and extension flows:

1. **web-auth-setup** (`apps/web/tests/auth.setup.ts`) - Runs once per test run to authenticate and cache storage
2. **@bypass/web-with-auth** (`apps/web/tests/specs/`) - Runs web specs with cached authenticated storage
3. **web-teardown** (`apps/web/tests/global-teardown.ts`) - Cleans up `.cache` after web tests complete
4. **extension-setup** (`apps/extension/tests/auth.setup.ts`) - Runs once per test run to authenticate and cache the Chrome profile
5. **@bypass/extension** (`apps/extension/tests/specs/`) - Parallel extension tests using cached authenticated profile
6. **extension-teardown** (`apps/extension/tests/global-teardown.ts`) - Cleans up `.cache` after extension tests complete

## Key Technologies

- **Frontend**: React, Preact (extension), Next.js (web)
- **UI**: shadcn/ui (Base UI) via `packages/ui` and `@bypass/ui`
- **Styling**: Tailwind CSS v4
- **Icons**: Hugeicons (`@hugeicons/core-free-icons`, `@hugeicons/react`)
- **Forms**: TanStack React Form + zod/mini validation
- **State**: Zustand
- **API**: tRPC for type-safe client-server communication
- **Backend**: Firebase with Admin SDK
- **Testing**: Playwright
- **Linting**: XO with custom config

## Code Patterns

- Use workspace protocol (`workspace:*`) for internal dependencies
- Shared types and utilities go in `packages/shared`
- tRPC procedures are defined in `packages/trpc`

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

All new UI components should be added to `packages/ui` and exported from `packages/ui/src/index.ts` for use across apps.

**IMPORTANT**: Never modify files inside `packages/ui` unless explicitly asked. The UI package contains shadcn/ui components that should remain unchanged unless adding new components or making approved modifications.

## Development Guidelines

- Ask any questions instead of assuming things when in plan mode
- Never automatically commit or push changes unless explicitly asked

## Specialized Skills

- Domain-specific agent skills live in `.agents/skills/`

## Post-Change Verification

After making changes, run the following commands:

```bash
pnpm lint
pnpm typecheck:all
pnpm e2e <relative-filepath>
```
