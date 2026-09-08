import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.env'
);

/** Root .env for local runs; Vercel injects env itself, so its builds never read the file. */
export const loadRootEnv = () => {
  if (!process.env.VERCEL && fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
};
