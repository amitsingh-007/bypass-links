# Setup on local

- Fork this repository.
- Run `npm install`.
- For local development:
  - Run `npm run ext:analyzer` to run bundle analyzer.
  - Run `npm run ext:dev` to watch/build extenion related configs.
  - Run `npm run ext:release` for production build.
  - Run `npm run ext:start` to watch/build the files for download page only.
  - Press `F5` or launch `Netlify Debugging` to run the server.

# Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

# Deploying to Netlify

- Run `netlify login` in the root folder and give credentials to login.
- Run `npm run dev:deploy` to deploy the site.
