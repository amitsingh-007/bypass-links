# Contributing

## Setup on local

- Fork this repository.
- Run `npm install`.
- For local development:
  - Run `npm run ext:dev` to watch extenion.
  - Run `npm run ext:build` for production build of extension.
  - Only once run `npm run dev:env` inside web folder. Then run `npm run web:dev` to watch web(NextJS).
  - Run `npm run web:build` for production build of NextJS.
  - Run `npm run vercel:preview` to preview Vercel prod build.
  - Run `npm run vercel:deploy` to deploy prod build on Vercel.
  - Press `F5` or launch `Vercel Web Debugging` to run the server.

## Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

## Connecting to the deployment platform

- Run `vercel link` in the root folder and give credentials to login.
