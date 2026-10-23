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

## Migrate legacy names before the Unicode release

Person and folder names previously used plain base64. The shared codec now applies URI encoding before base64, as bookmarks already do. Legacy names containing `%` need a server rewrite before releasing the new clients. Extension and web caches migrate their name fields once in place, preserving unsynced edits and pending flags. Bookmark titles and URLs keep their existing bytes.

With the matching project's `FIREBASE_SERVICE_ACCOUNT` in the root `.env`, prepare a plan on dev first:

```bash
node packages/trpc/src/scripts/migrate-text-codec.ts --project dev --dry-run --plan /tmp/codec-dev.json
```

The dry run reads records, prints every proposed path and its old and new values, and saves the same log to a new file with owner-only permissions. It writes nothing to Firebase and refuses to overwrite an existing plan. Review the count and every rewrite before applying that saved plan:

```bash
node packages/trpc/src/scripts/migrate-text-codec.ts --project dev --apply --plan /tmp/codec-dev.json
```

Repeat on prod with prod credentials and a separate plan before releasing either client. Keep the plans private because they contain names and account IDs. Applying a plan compares each current value with its recorded old value, skips already-applied values, and stops on any other change. A partially applied plan can be rerun safely. Resolve a conflicting record manually instead of regenerating the plan.

Generate plans only while all server names still use the legacy format. After the migration or any new client writes, the two encodings cannot be distinguished reliably from their contents. Generating a new plan then can double-encode names. Keep and reuse the original plan. The shortcuts API ticket extends this script with its separate rollout stage.
