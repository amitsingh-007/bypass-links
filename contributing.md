# Contributing

## Connecting to the deployment platform

- Run `vercel link` in the root folder and give credentials to login. This will be used to fetch env variables.

## Setup on local

- Fork this repository.
- Run `pnpm install` in the root folder.
- Verify git hooks are installed by running `pnpm lefthook check-install` in the root folder.
- If hooks are missing, run `pnpm lefthook install` to reinstall them.
- Useful commands:
  - Run `pnpm run env` to pull env variables.
  - Run `pnpm dev` to start dev server for local development.
  - Run `pnpm build` for production build.
  - Run `pnpm lint` to lint all files.
  - Run `pnpm e2e` to run e2e of all workspaces.

## Guidelines for development

- Install [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.
