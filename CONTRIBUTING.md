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
- Extension popup should not access firebase API directly(to avoid code duplication)
