# Contributing

## Setup on local

- Fork this repository.
- Run `npm install && npm run bootstrap`.
- For local development:
  - Run `npm run ext:dev` to watch extenion.
  - Run `npm run ext:build` for production build of extension.
  - Run `npm run web:dev` to watch web(NextJS).
  - Run `npm run web:build` for production build of NextJS.
  - Run `npm run netlify:dev` to watch web(Netlify).
  - Run `npm run vercel:preview` to preview Vercel prod build.
  - Run `npm run vercel:deploy` to deploy prod build on Vercel.
  - Run `npm run vercel:preview` to preview Netlify prod build.
  - Run `npm run netlify:deploy` to deploy prod build on Netlify.
  - Press `F5` or launch `Vercel Web Debugging` to run the server.

## Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

## Connecting to the deployment platform

- Run `netlify login` in the root folder and give credentials to login.
- Run `vercel link` in the root folder and give credentials to login.
