import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SESSION_FILE = path.join(process.cwd(), '.cache', 'auth-session.json');

// Check if running extension tests - globalTeardown runs for all projects
const isExtensionTest = !process.env.TEST_WEB_SERVER;

export default async function globalTeardown() {
  // Skip for web tests
  if (!isExtensionTest) {
    return;
  }

  try {
    await fs.unlink(SESSION_FILE);
  } catch {
    // Session file might not exist, that's okay
  }
}
