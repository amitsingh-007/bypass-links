# Setup on local

- Fork this repository.
- Run `npm install`.
- For local development:
  - Run `npm run analyzer` to run bundle analyzer.
  - Run `npm run dev` to watch/build extenion related configs.
  - Run `npm run start` to watch/build the files for download page only.
  - Run `npm run release` for production build.

# Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Attach comments to complex logic, if required.

# Deploying to Netlify

- Run `netlify login` in the root folder.
- After succesfully logging in through the web interface, it will create a gitignored folder named `.netlify`.
- Now, everything should be working fine.
