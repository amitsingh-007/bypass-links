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

Generate plans only while all server names still use the legacy format. After the migration or any new client writes, the two encodings cannot be distinguished reliably from their contents. Generating a new plan then can double-encode names. Keep and reuse the original plan. Use the separate shortcuts scope below for its later server rollout.

## Roll out the plain-text shortcuts API

The new `firebaseData.redirectionsList` procedure returns plain values, and both API versions accept plain shortcut saves. The server stores aliases and targets with the shared codec. `redirectionsGet` remains for older extensions and converts storage back to their plain-base64 wire format. Latin-1 values remain exact. Unicode URLs use their browser URL form, so older versions show escaped text and punycode hosts. Invalid Unicode URLs receive escaped characters without changing their existing separators or percent escapes. New clients receive their original Unicode text.

Prepare the shortcuts plan while all stored shortcuts still use the legacy encoding. This scope does not revisit person or folder names. It records every shortcut row, preserves existing IDs, and assigns missing IDs once in the saved plan:

```bash
node packages/trpc/src/scripts/migrate-text-codec.ts --project dev --scope shortcuts --dry-run --plan /tmp/shortcuts-dev.json
```

Review the private plan. Follow this order on dev, then repeat it on prod with the matching credentials and a separate saved plan:

1. Deploy the server with the new list procedure, new write encoding, and legacy read shim.
2. Immediately apply the reviewed plan generated before that deployment:

   ```bash
   node packages/trpc/src/scripts/migrate-text-codec.ts --project dev --scope shortcuts --apply --plan /tmp/shortcuts-dev.json
   ```

3. Verify new and legacy API reads, then release the updated extension.

Applying the plan compares whole rows, skips already-applied rows, and stops if any row changed since the dry run. Reuse the same plan for a retry so generated IDs stay stable. Do not create a fresh legacy plan after the server deployment, when old and new encodings can coexist. A short window of incorrect decoding for percent-containing values between server deployment and plan application is accepted. Do not release the extension until application and API verification succeed.

The extension upgrades both shortcut caches to item version 2 in place, decoding old values and assigning missing IDs without remote sync. Keep the legacy read shim and auth upgrade bridge until older extension adoption is negligible. Their removal is tracked in #4356.

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

The [CI rules setup guide](docs/firebase-rules-ci.md) describes the maintainer's one-time keyless cloud setup and first deployment checks.
