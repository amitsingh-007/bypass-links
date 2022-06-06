import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'd5xzoq',
  chromeWebSecurity: false,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents() {},
    baseUrl: 'http://localhost:3000/',
  },
});
