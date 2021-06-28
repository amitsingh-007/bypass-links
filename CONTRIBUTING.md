# Setup on local

- Fork this repository.
- Run `npm install`.
- For local development:
  - Run `npm run ext:analyzer` to run bundle analyzer on extension.
  - Run `npm run ext:dev` to watch extenion.
  - Run `npm run ext:release` for production build of extension.
  - Run `npm run web:dev` to watch web.
  - Press `F5` or launch `Netlify Debugging` to run the server.

# Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

# Deploying to Netlify

- Run `netlify login` in the root folder and give credentials to login.
- Run `npm run dev:deploy` to deploy the site.
