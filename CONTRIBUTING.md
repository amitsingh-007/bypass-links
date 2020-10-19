# Setup on local

- Fork this repository.
- Run `npm i` or `npm install`.
- For local development:
  - Run `npm run dev:ext` to build only extension
  - Run `npm run dev` to build extenion as well as download page.
  - Run `npm run start` to watch and build the file for download page only.
  - Run `npm run release` for production build.

# Guidelines for development

- Install [prettier]("https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode") and enable for this workplace, with default settings.
- Follow `pascalCase` for this project.
- Create new file for bypassing a new site named `bypass<file_name>`.
- Attach comments to complex logic, if required.
