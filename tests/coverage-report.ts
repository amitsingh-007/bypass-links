import { generateCoverageReport } from '@bypass/shared/tests';

/** Merges what every worker collected into one report. No-op unless CI set COVERAGE. */
const globalTeardown = async () => {
  await generateCoverageReport();
};

export default globalTeardown;
