# AGENTS.md

This file contains guidelines for agentic coding assistants working in this repository.

## Build/Lint/Test Commands

### Primary Commands (run from root)

- `pnpm build` - Build all apps and packages (via Turborepo)
- `pnpm lint` - Run XO linter on all workspaces
- `pnpm dev` - Start all dev servers (extension + web)
- `pnpm dev:env` - Pull environment variables from Vercel

### Testing Commands

- `pnpm e2e` - Run all Playwright E2E tests
- `pnpm test` - Run all workspace tests (via Turborepo)

### Running Single Tests

- `playwright test <test-file>` - Run specific test file
  - Example: `playwright test apps/extension/tests/specs/bookmarks.spec.ts`
  - Example: `playwright test apps/web/tests/specs/landing.spec.ts`
- `playwright test --project <project-name>` - Run tests for specific project
  - Example: `playwright test --project @bypass/extension`
  - Example: `playwright test --project @bypass/web`
- `playwright test --grep "<pattern>"` - Run tests matching pattern
  - Example: `playwright test --grep "should create bookmark"`

### Extension-Specific Commands

- `pnpm dev:chrome` - Start extension dev server for Chrome
- `pnpm dev:firefox` - Start extension dev server for Firefox
- `pnpm build:chrome` - Build extension for Chrome production
- `pnpm build:firefox` - Build extension for Firefox production

### Web App-Specific Commands

- `pnpm -F @bypass/web dev` - Start Next.js dev server only
- `pnpm -F @bypass/web build` - Build web app only

## Code Style Guidelines

### Naming Conventions

- **Components/Classes**: PascalCase (e.g., `BookmarkPanel.tsx`, `AuthService.ts`)
- **Files**: PascalCase for components, camelCase for utilities
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Interfaces/Types**: PascalCase (prefer `interface` over `type`)
- **Functions/Variables**: camelCase

### TypeScript Guidelines

- **Strict Mode**: Enabled with `noImplicitReturns`, `allowUnreachableCode: false`
- **Interface vs Type**: Always prefer `interface` over `type` for object shapes (enforced by ESLint)
- **Exhaustive Switches**: Required with `considerDefaultExhaustiveForUnions: true`
- **Module Resolution**: Uses `bundler` mode with `react-jsxdev` transform

### Import Guidelines

- Use exact dependency versions (no `^` or `~`)
- Prefer workspace packages (`@bypass/shared`, `@bypass/trpc`) for shared code
- Use path aliases: `@/*` for extension src, `@components/*`, `@constants/*`, etc.
- React imports: `import { useState } from 'react'` (no React.default in JSX)

### Formatting (Prettier)

- Single quotes
- 2 space indentation
- Trailing commas (ES5)
- Bracket spacing enabled
- Auto line endings

### Error Handling

- Use `TRPCError` for API errors with appropriate error codes
- Use try/catch with meaningful error messages
- Log errors appropriately (avoid logging secrets)

### React/Component Guidelines

- Use React 19 features (no `React.` prefix needed)
- Use Mantine components for UI instead of custom implementations
- Use Zustand for global state management
- Use Mantine Form for form handling
- Support dark theme (use Mantine's color scheme)

### Extension-Specific Guidelines

- Manifest V3 architecture with Service Worker background script
- Minimal required permissions (follow least privilege)
- Content Security Policy configured in manifest
- Use Wouter for routing (wouter-preact for Preact)
- Use Preact for smaller bundle size (React aliases applied)

### Playwright Test Guidelines

- Use fixtures for setup/teardown (auth, extension context)
- Prefer accessible selectors (`getByRole`, `getByLabel`)
- Use direct name matches over regex for button selectors
- Add meaningful test IDs for complex UI elements
- Avoid hardcoded waits - use Playwright's auto-waiting
- Test with real Firebase auth using injected ID tokens

### General Best Practices

- Always run `pnpm lint` before suggesting code changes
- Consider both Chrome and Firefox for extension changes
- Write Playwright tests for new features
- Update types in shared package when changing schemas
- Check Turborepo cache implications for build changes
- Use tRPC for type-safe API communication
- Keep comments concise - only for complex logic

## Project Structure

- `apps/extension/` - Chrome/Firefox extension source
- `apps/web/` - Next.js web application
- `packages/shared/` - Shared UI components, logic, types, schemas
- `packages/trpc/` - API layer (client + server)
- `packages/configs/` - Shared configurations

## Dependencies

- **Package Manager**: pnpm (enforced via packageManager field)
- **Module System**: ESM (all packages use `"type": "module"`)
- **Monorepo Tools**: pnpm workspaces + Turborepo
- All dependencies use exact versions
