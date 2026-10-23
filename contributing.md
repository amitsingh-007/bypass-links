# Contributing

## Local setup

Use Node.js 24 and pnpm 12. Fork and clone the repository, then run `pnpm install` at the root. The install script sets up the Git hooks in `.lefthook.yml` (oxlint and oxfmt on staged files); if they are missing, run `pnpm lefthook install`.

Running the full app and E2E suite requires access to this project's Vercel environment and its test credentials. If you have access, link the project with `pnpm vercel link`, then run `pnpm run env` to pull variables into the root `.env` file. Install the E2E browser with `pnpm exec playwright install chromium`, and start `pnpm dev` before running `pnpm e2e`.

## Commands

| Command              | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Start the workspace development servers.                 |
| `pnpm build`         | Build the workspaces.                                    |
| `pnpm lint`          | Run oxlint with autofix.                                 |
| `pnpm lint:ci`       | Check lint without autofix.                              |
| `pnpm format`        | Format files with oxfmt.                                 |
| `pnpm format:check`  | Check formatting without rewriting files.                |
| `pnpm typecheck:all` | Type-check all workspaces.                               |
| `pnpm e2e`           | Run the Playwright suite; requires the test environment. |

The [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) supports the repository's lint and format tools.

## Firebase security rules

Edit `firebase/database.rules.json` and `firebase/storage.rules` in the repo. Review and deploy those changes instead of editing the Firebase console. `.firebaserc` maps `dev` to `bypass-links-dev` and `prod` to `bypass-links`.

The initial files are verbatim exports from both projects. The dev and prod exports matched exactly. The database rules are excluded from formatting to preserve that export.

Use the pinned CLI on demand, without adding a dependency:

```bash
pnpm dlx firebase-tools@15.34.1 login
pnpm dlx firebase-tools@15.34.1 deploy --project dev --only database,storage --dry-run
pnpm dlx firebase-tools@15.34.1 deploy --project prod --only database,storage --dry-run
```

After reviewing the dry runs, deploy to dev first, then prod by running the same commands without `--dry-run`. The first deployment must preserve the existing rules. Tightening access requires a separate change.
