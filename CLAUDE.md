# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
pnpm dev:env          # Pull Vercel environment variables to .env

# Building (turbo orchestrates with dependency graph)
pnpm build            # Build all workspaces

# Extension-specific builds
cd apps/extension
pnpm build:chrome     # Build Chrome extension to chrome-build/
pnpm dev:chrome       # Chrome dev server with hot reload

# Code Quality
pnpm lint             # Lint all files (XO linter)
pnpm typecheck        # Type check root only
pnpm typecheck:all    # Type check all workspaces

# Testing
pnpm test             # Run all tests
pnpm e2e              # Run Playwright E2E tests
```

## Architecture

This is a **Turbo + pnpm monorepo** with the following structure:

- **apps/extension** - Browser extension (Webpack, React with Preact, Wouter for routing)
- **apps/web** - Next.js web interface for downloads and admin
- **packages/shared** - Shared React components, types, utilities, and stores (Zustand)
- **packages/configs** - Shared TypeScript, ESLint (XO), and build configs
- **packages/trpc** - tRPC router with Firebase backend (type-safe API)

## Build System

Turbo manages task dependencies defined in `turbo.json`:
- `build` tasks depend on `//#lint` and `//#typecheck` completing first
- Extension builds use `EXT_BROWSER` environment variable (chrome/firefox)

## E2E Testing

Playwright tests use a unique setup/teardown pattern for extension testing:

1. **extension-setup** (`apps/extension/tests/auth.setup.ts`) - Runs once per test run to authenticate and cache the Chrome profile
2. **@bypass/extension** (`apps/extension/tests/specs/`) - Parallel tests using cached authenticated profile
3. **extension-teardown** (`apps/extension/tests/global-teardown.ts`) - Cleans up .cache directory

## Key Technologies

- **Frontend**: React, Preact (extension), Next.js (web)
- **UI**: Mantine (design system)
- **State**: Zustand
- **API**: tRPC for type-safe client-server communication
- **Backend**: Firebase with Admin SDK
- **Testing**: Playwright
- **Linting**: XO with custom config

## Code Patterns

- Use workspace protocol (`workspace:*`) for internal dependencies
- Shared types and utilities go in `packages/shared`
- tRPC procedures are defined in `packages/trpc`
