import fs from 'node:fs';
import { FullConfig } from '@playwright/test';

export const tempDir = '/tmp/playwright-temp';

const globalSetup = (_config: FullConfig) => {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
};

export default globalSetup;
