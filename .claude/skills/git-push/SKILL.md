---
name: git-push
description: Create a branch from main, commit staged changes, push, and create a PR
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: git-workflow
---

## What I do

I automate the complete Git workflow for getting changes from your working directory to a pull request:

1. **Check current branch** - If on `main`, create a new branch first; otherwise use current branch
2. **Create a new branch** (only if on `main`) - Auto-generate from commit message: `<f/b/h>-<name>`
   - `f-` for feature
   - `b-` for bugfix
   - `h-` for hotfix
3. **Check if PR exists** - If a PR already exists for this branch, skip PR creation
4. **Commit staged changes** - Commit only the staged files (not unstaged changes)
5. **Push to remote** - Push the branch to origin
6. **Create a PR** - Only if no PR exists yet, use `gh` CLI to create a pull request against `main`

## When to use me

Use this when you have **staged changes** ready to be committed and turned into a PR.

I will ask clarifying questions if:
- No changes are staged (nothing to commit) - I will ABORT and tell you to stage files yourself. I will NOT offer to stage files for you.

**Important behaviors**:
- I never ask whether to commit staged or all files - I always commit ONLY staged changes
- If there are no staged changes, I ABORT and do NOT offer to stage files for you
- I do not run `git add` - the user must stage files themselves

## Prerequisites

- **User must stage files** using `git add` before running this skill
- **Must have `gh` CLI installed and authenticated**

## Branch Naming Convention

I auto-generate branch names based on commit type:

| Commit message pattern | Branch name |
|-----------------------|-------------|
| `feat: add dark mode` | `f-add-dark-mode` |
| `fix: resolve login bug` | `b-resolve-login-bug` |
| `feat!: breaking change` | `h-breaking-change` |

## How I create PRs

I use `gh pr create` with:
- **Title**: Derived from your commit message
- **Body**: Empty (no auto-generated description)
- **Base**: `main` branch

## Example Usage

```bash
# Stage your changes first
git add src/components/Button.tsx
git add tests/Button.test.tsx

# Then invoke the skill
/git-push
```

I auto-generate the commit message based on the staged changes.

## Safety Checks

I will **abort** if:
- No staged changes exist
- Git working directory has conflicts or errors

## Commands I Run

```bash
# Check current branch
git branch --show-current

# If on main, create new branch
git checkout -b <branch-name>

# Commit staged changes
git commit -m "<commit-message>"

# Push to remote
git push -u origin $(git branch --show-current)

# Check if PR exists, if not create one
if ! gh pr view --json url >/dev/null 2>&1; then
  gh pr create --base main --title "<title>" --body ""
fi
```

## After Running

I'll provide:
- If new PR created: Clickable PR URL
- If PR already exists: Confirmation that changes were pushed to existing PR
