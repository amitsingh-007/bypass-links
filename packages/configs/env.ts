import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.env'
);

/** Root .env for local runs; hosted builds inject env and ship no file. */
export const loadRootEnv = () => {
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
};
