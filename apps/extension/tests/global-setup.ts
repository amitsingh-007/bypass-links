import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';

// Load environment variables
process.loadEnvFile(path.join(process.cwd(), '.env'));

const SESSION_FILE = path.join(process.cwd(), '.cache', 'auth-session.json');

// Check if running extension tests (via TEST_WEB_SERVER env or project detection)
// globalSetup runs for all projects, so we skip for web tests
const isExtensionTest = !process.env.TEST_WEB_SERVER;

export default async function globalSetup() {
  // Skip for web tests - only extension tests need Firebase auth
  if (!isExtensionTest) {
    return;
  }

  // Import signInWithEmailAndPassword dynamically since globalSetup runs outside normal module resolution
  const authUtilPath = path.resolve(
    process.cwd(),
    './apps/extension/tests/utils/auth.ts'
  );
  const { signInWithEmailAndPassword } = await import(authUtilPath);

  const authData = await signInWithEmailAndPassword();

  const cacheDir = path.dirname(SESSION_FILE);
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(SESSION_FILE, JSON.stringify(authData, null, 2), 'utf8');
}
