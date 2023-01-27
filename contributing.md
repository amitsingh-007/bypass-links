# Contributing

## Setup on local

- Fork this repository.
- Run `pnpm install` in the root folder.
- For local development:
  - Run `pnpm dev:env` inside web folder to pull env variables.
  - Run `pnpm dev` to develop.
  - Run `pnpm build` for production build.
  - Run `pnpm e2e` to run e2e of all workspaces.
  - Run `pnpm test` to run tests of all workspaces.

## Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

## Connecting to the deployment platform

- Run `vercel link` in the root folder and give credentials to login.
