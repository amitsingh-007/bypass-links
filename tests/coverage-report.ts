import {
  AUTH_CACHE_DIR,
  generateCoverageReport,
  removeTestDir,
} from '@bypass/shared/tests';

/** Coverage is a no-op unless CI set COVERAGE. */
const globalTeardown = async () => {
  await generateCoverageReport();
  await removeTestDir(AUTH_CACHE_DIR);
};

export default globalTeardown;
