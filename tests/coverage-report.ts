import { generateCoverageReport } from '@bypass/shared/tests';

/** No-op unless CI set COVERAGE. */
const globalTeardown = async () => {
  await generateCoverageReport();
};

export default globalTeardown;
