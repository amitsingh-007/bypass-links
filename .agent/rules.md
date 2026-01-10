# Bypass Links Project Rules

## Project Overview

This is a **monorepo** for the Bypass Links project - an open-source browser extension (Chrome & Firefox) with a companion web application. The project uses **pnpm workspaces**, **Turborepo**, and follows a **modular architecture** with shared packages.

### Architecture

- **Apps**: `apps/extension` (Chrome/Firefox extension), `apps/web` (Next.js web app)
- **Packages**: `packages/shared` (shared UI/logic), `packages/trpc` (API layer), `packages/configs` (shared configs)
- **Monorepo Tools**: pnpm workspaces, Turborepo for build orchestration
- **Testing**: Playwright for E2E tests (both extension and web)

## Technology Stack

### Core Technologies

- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: pnpm 10.24.0
- **Build Tool**: Turborepo
- **Module System**: ESM (all packages use `"type": "module"`)

### Extension Stack

- **UI Framework**: React 19 + Preact (for optimization)
- **Bundler**: Webpack 5 with custom configuration
- **State Management**: Zustand
- **Routing**: Wouter (wouter-preact)
- **UI Library**: Mantine 8.3.6
- **Styling**: PostCSS with Mantine preset, CSS Modules
- **API Client**: tRPC client, Wretch for HTTP
- **Form Handling**: Mantine Form
- **Virtualization**: TanStack Virtual

### Web App Stack

- **Framework**: Next.js (App Router)
- **UI Library**: Mantine
- **Styling**: PostCSS with Mantine preset
- **API**: tRPC server
- **Backend**: Firebase (Auth & Admin), Vercel deployment
- **Analytics**: Vercel Analytics & Speed Insights

### Shared Dependencies

- **Validation**: Zod
- **Utilities**: clsx, md5, dayjs (web only)
- **Icons**: react-icons

## Code Style & Conventions

### Naming Conventions

- **Case Style**: Use **PascalCase** for this project (as per contributing.md)
- **Files**: PascalCase for components/classes, camelCase for utilities
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Interfaces/Types**: PascalCase, prefer `interface` over `type` (enforced by ESLint)

### TypeScript

- **Strict Mode**: Enabled with additional checks (`noImplicitReturns`, `allowUnreachableCode: false`)
- **Module Resolution**: `bundler` mode
- **JSX**: `react-jsxdev`
- **Path Aliases**: Use `@/*` for extension src, workspace packages via `@bypass/*`
- **Type Definitions**: Prefer `interface` over `type` (ESLint rule enforced)
- **Exhaustive Switches**: Required with `considerDefaultExhaustiveForUnions: true`

### Code Formatting

- **Formatter**: Prettier with project-specific config
  - Single quotes
  - 2 space indentation
  - Trailing commas (ES5)
  - Bracket spacing enabled
  - Auto line endings
- **Linter**: XO (ESLint wrapper) with custom config
  - React support enabled
  - Next.js plugin for web app
  - Many strict rules disabled (see xo.config.ts)

### Comments

- Attach comments to complex logic **only when necessary**
- Avoid redundant or obvious comments
- Keep comments concise and meaningful

## File Structure & Organization

### Extension Structure (`apps/extension/src/`)

```
@types/          - Type definitions
BackgroundScript/ - Service worker logic
BookmarksPanel/   - Bookmarks feature
HomePopup/        - Main popup UI
PersonsPanel/     - Person tagging system
SettingsPanel/    - Settings UI
ShortcutsPanel/   - Shortcuts feature
apis/            - API integrations
components/      - Shared components
constants/       - App constants
helpers/         - Helper functions
hooks/           - Custom React hooks
interfaces/      - Shared interfaces
provider/        - Context providers
store/           - Zustand stores
utils/           - Utility functions
```

### Path Aliases (Extension)

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@constants/*` → `./src/constants/*`
- `@helpers/*` → `./src/helpers/*`
- `@interfaces/*` → `./src/interfaces/*`
- `@store/*` → `./src/store/*`

### Shared Package Exports

- Main: `@bypass/shared`
- Styles: `@bypass/shared/styles/*`
- Schema: `@bypass/shared/schema`
- Types: `@bypass/shared/types/*`

## Development Workflow

### Commands

- **Install**: `pnpm install` (root)
- **Dev Environment**: `pnpm dev:env` (pull Vercel env vars)
- **Development**: `pnpm dev` (starts all dev servers via Turbo)
- **Build**: `pnpm build` (builds all apps via Turbo)
- **Lint**: `pnpm lint` (runs XO linter)
- **E2E Tests**: `pnpm e2e` (runs Playwright tests)
- **Unit Tests**: `pnpm test` (runs workspace tests)
- **Pre-commit**: `pnpm precommit` (lint-staged via Husky)

### Extension-Specific Commands

- `pnpm dev:chrome` - Dev server for Chrome
- `pnpm dev:firefox` - Dev server for Firefox
- `pnpm build:chrome` - Production build for Chrome
- `pnpm build:firefox` - Production build for Firefox

### Environment Variables

- Managed via Vercel (`vercel env pull .env`)
- Key vars: `EXT_BROWSER`, `NODE_ENV`, `HOST_NAME`, `GITHUB_TOKEN`, Firebase configs, Playwright test URL
- See `turbo.json` for full list of `globalEnv`

### Git Workflow

- **Pre-commit Hooks**: Husky + lint-staged (runs linter on staged files)
- **Branch Protection**: CI checks required (build, lint, Playwright, CodeQL)
- **PR Template**: Available at root

## Testing

### Playwright Configuration

- **Global Timeout**: 30 minutes
- **Expect Timeout**: 5 seconds
- **Navigation Timeout**: 30 seconds
- **Action Timeout**: 10 seconds
- **Retries**: 0 (no retries)
- **Parallel**: Fully parallel execution
- **Reporters**: GitHub Actions + HTML (open: never)
- **Screenshots**: Only on failure
- **Video**: On first retry
- **Trace**: Retain on failure
- **Headless**: true

### Test Projects

1. **@bypass/web**: Tests in `apps/web/tests/`, baseURL: `http://localhost:3000` (or CI URL)
2. **@bypass/extension**: Tests in `apps/extension/tests/`, baseURL: `chrome-extension://chadipececickdfjckjkjpehlhnkclmb`

### Test Structure (Extension)

```
tests/
  constants.ts           - Test constants
  fixtures/
    auth-fixture.ts      - Firebase auth fixture
    bookmark-fixture.ts  - Bookmark test helpers
    extension-fixture.ts - Extension setup fixture
  specs/
    auth.spec.ts         - Auth tests
    bookmarks.spec.ts    - Bookmark tests
    home-popup.spec.ts   - Popup tests
  utils/
    test-utils.ts        - Test utilities
```

### Playwright Best Practices (Based on Project)

- Use **fixtures** for setup/teardown (auth, extension context)
- Use **accessible selectors** when possible (`getByRole`, `getByLabel`)
- Prefer **direct name matches** over regex for button selectors
- Use **meaningful test IDs** for complex UI elements
- **Avoid hardcoded waits** - use Playwright's auto-waiting
- **Test with real auth** using Firebase ID tokens injected into storage
- Keep selectors **robust and maintainable**

## Build & Deployment

### Turborepo Configuration

- **Cache**: Enabled for builds, disabled for dev
- **Dependencies**: Build depends on lint passing
- **Outputs**:
  - Extension: `chrome-build/**`, `firefox-build/**`
  - Web: `.next/**`
- **Global Dependencies**: `.env`, `xo.config.ts`, `.github/**`

### CI/CD Workflows

- **Build**: Validates builds on PR
- **Lint**: XO linter check
- **Playwright**: E2E tests on PR
- **CodeQL**: Security analysis
- **Release**: Automated deployment (extension + web)
- **Firebase Cron**: Scheduled backup job

### Deployment Platforms

- **Web App**: Vercel (Next.js)
- **Extension**: Chrome Web Store + Firefox Add-ons (via GitHub releases)

## Dependencies Management

### Package Manager Config

- **pnpm**: Version enforced via `packageManager` field
- **Workspace Protocol**: `workspace:*` for internal packages
- **Only Built Dependencies**: Specific packages built from source (see pnpm-workspace.yaml)

### Version Pinning

- All dependencies use **exact versions** (no `^` or `~`)
- Renovate bot manages updates (see renovate.json)

### Peer Dependencies

- Shared package uses peer dependencies for common libs (React, Mantine, Zod, etc.)
- Ensures single version across monorepo

## Security & Best Practices

### Authentication

- **Firebase Auth**: Used for user authentication
- **TOTP 2FA**: Two-factor authentication supported
- **Client-side Encryption**: Data encoded before sending to server

### Browser Extension

- **Manifest V3**: Modern extension architecture
- **Service Worker**: Background script as service worker
- **Content Security Policy**: Configured in manifest
- **Permissions**: Minimal required permissions

### Code Quality

- **Strict TypeScript**: All strict checks enabled
- **ESLint**: XO with custom rules
- **Prettier**: Consistent formatting
- **Pre-commit Hooks**: Prevent bad commits
- **CodeQL**: Automated security scanning

## Common Patterns

### State Management (Extension)

- Use **Zustand** for global state
- Keep stores modular in `src/store/`
- Avoid prop drilling with context when needed

### API Communication

- **tRPC**: Type-safe API calls between extension/web and backend
- **Wretch**: HTTP client for external APIs
- **Error Handling**: Use TRPCError for API errors

### Styling

- **Mantine Components**: Primary UI library
- **CSS Modules**: For custom styles
- **PostCSS**: With Mantine preset and simple vars
- **Dark Theme**: Full support required

### Performance

- **Code Splitting**: Webpack chunks for extension
- **Preact Aliases**: Used in extension for smaller bundle
- **Tree Shaking**: Enabled via ESM + sideEffects: false
- **Virtualization**: TanStack Virtual for long lists

## File Exclusions

### Git Ignore

- `node_modules/`, `.turbo/`, `.vercel/`
- Build outputs: `chrome-build/`, `firefox-build/`, `.next/`
- Test outputs: `playwright-report/`, `test-results/`
- Environment: `.env` (tracked but contains placeholders)

### TypeScript Exclude

- `node_modules`, `playwright-report`, `test-results`, `.turbo`
- Extension: `chrome-build`, `firefox-build`

## Special Configurations

### Webpack (Extension)

- **Source Maps**: Enabled for debugging
- **Hot Reload**: Prefresh for Preact
- **TypeScript**: ts-loader with fork-ts-checker
- **CSS**: MiniCssExtractPlugin for production
- **Optimization**: Terser for minification, CSS minimizer
- **Plugins**: Clean, Copy, HTML, MergeJsons (for manifest)

### Next.js (Web)

- **App Router**: Modern Next.js architecture
- **SVGR**: SVG imports as React components
- **React Compiler**: Babel plugin enabled
- **Image Optimization**: Sharp for production

### Firebase

- **Admin SDK**: Server-side operations (web app)
- **Client SDK**: Extension authentication
- **Service Account**: Environment variable for CI/CD

## AI Assistant Guidelines

When working on this project:

1. **Always use exact versions** when adding dependencies
2. **Prefer workspace packages** (`@bypass/*`) for shared code
3. **Use path aliases** defined in tsconfig.json
4. **Follow PascalCase** for file and component names
5. **Run linter** before suggesting code changes
6. **Consider both Chrome and Firefox** for extension changes
7. **Use Mantine components** instead of custom UI when possible
8. **Write Playwright tests** for new features
9. **Update types** in shared package when changing schemas
10. **Check Turbo cache** implications for build changes
11. **Use fixtures** for Playwright test setup
12. **Prefer interfaces over types** for object shapes
13. **Add exhaustive switch cases** with default handlers
14. **Use tRPC** for type-safe API communication
