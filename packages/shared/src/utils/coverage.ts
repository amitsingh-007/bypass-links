import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { type BrowserContext, type Page } from '@playwright/test';
import type {
  CoverageClient,
  CoverageReport,
  CoverageReportOptions,
} from 'monocart-coverage-reports';

/**
 * Set only by CI, which builds the extension with sourcemaps in the same run.
 * Local runs use the dev build, whose sourcemaps name their sources by basename
 * only and cannot be attributed back to a file.
 */
const isCoverageEnabled = process.env.COVERAGE === '1';

const COVERAGE_OUTPUT_DIR = path.join('.playwright', 'coverage');

/**
 * Source dirs counted toward coverage; packages/ui is vendored shadcn, and
 * packages/trpc only ever runs on the server, out of reach of browser V8.
 */
const COVERED_SOURCE_DIRS = [
  'apps/extension/src',
  'apps/web/src',
  'packages/shared/src',
];

/** Not JavaScript, so no V8 entry can ever be attributed back to them. */
const UNCOVERABLE_EXTENSIONS = ['.svg', '.css', '.md', '.html', '.d.ts'];

const isCoverableSource = (filePath: string) =>
  COVERED_SOURCE_DIRS.some((dir) => filePath.includes(dir)) &&
  !UNCOVERABLE_EXTENSIONS.some((extension) => filePath.endsWith(extension));

const APP_ROOTS = ['apps/extension', 'apps/web'];

// Trailing slash trimmed: the preview url is passed through from CI, and one
// would make every `${origin}/_next/` comparison miss and silently zero the web
const WEB_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL?.replace(/\/+$/, '');

/** Set from the fixture that loads the extension, so the path is not re-derived. */
let extensionBuildDir: string | undefined;

export const setExtensionBuildDir = (dir: string) => {
  extensionBuildDir = dir;
};

/** Maps a chrome-extension:// URL back to its file in the build output. */
const resolveExtensionFile = (url: string): string | null => {
  if (!extensionBuildDir) {
    return null;
  }
  const relativePath = new URL(url).pathname.replace(/^\//, '');
  const file = path.resolve(extensionBuildDir, relativePath);
  return fs.existsSync(file) ? file : null;
};

type SourceMapResolver = NonNullable<
  CoverageReportOptions['sourceMapResolver']
>;

const sourceMapResolver: SourceMapResolver = async (url, defaultResolver) => {
  if (url.startsWith('chrome-extension://')) {
    // Not fetchable over HTTP, which is what the default resolver does
    const file = resolveExtensionFile(url);
    return file ? await fs.promises.readFile(file, 'utf8') : null;
  }
  return await (defaultResolver as (mapUrl: string) => Promise<unknown>)(url);
};

/**
 * A bundle's `../../src/foo.ts` clamps at the chrome-extension:// origin, losing
 * the `apps/<app>` prefix. Restore it from the file that actually exists, or the
 * entry never matches COVERED_SOURCE_DIRS and the extension reports as zero.
 */
const sourcePath = (filePath: string) => {
  if (filePath.startsWith('apps/') || filePath.startsWith('packages/')) {
    return filePath;
  }
  const owners = APP_ROOTS.filter((root) =>
    fs.existsSync(path.resolve(process.cwd(), root, filePath))
  );
  return owners.length === 1 ? `${owners[0]}/${filePath}` : filePath;
};

const coverageOptions: CoverageReportOptions = {
  name: 'Bypass Links E2E Coverage',
  outputDir: COVERAGE_OUTPUT_DIR,
  reports: ['v8', 'console-summary'],
  logging: 'error',
  sourceMapResolver,
  sourcePath,
  // Scoped to our own code: a broader filter makes the report generation fetch
  // sourcemaps from third-party hosts before discarding them. Narrowed to
  // `_next` because Vercel serves its own analytics and protection scripts from
  // the same origin, and they dominated the function and branch denominators.
  entryFilter: (entry: { url: string }) =>
    entry.url.startsWith('chrome-extension://') ||
    (WEB_BASE_URL !== undefined &&
      entry.url.startsWith(`${WEB_BASE_URL}/_next/`)),
  // Executed files only: padding the denominator with every never-imported file
  // meant hand-maintaining an exclusion list to keep it honest.
  sourceFilter: isCoverableSource,
};

let report: CoverageReport | undefined;

/**
 * One report per process, imported lazily: every test file pulls in this module
 * via `@bypass/shared/tests`, and monocart costs ~40ms and ~10MB to load.
 * Playwright workers are separate processes, so each appends to the shared cache
 * dir and global teardown merges them.
 */
const getReport = async () => {
  if (!report) {
    const { CoverageReport } = await import('monocart-coverage-reports');
    report = new CoverageReport(coverageOptions);
  }
  return report;
};

const addCoverage = async (entries: unknown[]) => {
  if (entries.length === 0) {
    return;
  }
  await (await getReport()).add(entries);
};

/** Collection runs inside teardown chains, so it must never throw into them. */
const safely = async (collect: () => Promise<void>) => {
  try {
    await collect();
  } catch (error) {
    console.warn(`[coverage] collection failed: ${String(error)}`);
  }
};

/**
 * Only instrumented pages may be drained: calling `stopJSCoverage` on a page
 * that never started it can hang teardown (`data:`/`file:` tabs especially).
 */
const coveredPages = new WeakSet<Page>();

const collectPageCoverage = async (page: Page) => {
  if (!coveredPages.has(page) || page.isClosed()) {
    return;
  }
  coveredPages.delete(page);
  await safely(async () => {
    const entries = await page.coverage.stopJSCoverage();
    await addCoverage(entries);
  });
};

/**
 * Makes a context self-instrumenting, rather than relying on each call site to
 * remember: coverage starts before the caller can navigate, and both pages and
 * the background worker are drained before anything closes, since closing drops
 * the V8 data.
 */
export const instrumentContext = (context: BrowserContext) => {
  if (!isCoverageEnabled) {
    return;
  }

  const openPage = context.newPage.bind(context);
  context.newPage = async () => {
    const page = await openPage();
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    coveredPages.add(page);

    const closePage = page.close.bind(page);
    page.close = async (options) => {
      await collectPageCoverage(page);
      await closePage(options);
    };
    return page;
  };

  const closeContext = context.close.bind(context);
  context.close = async (options) => {
    await collectContextCoverage(context);
    await closeContext(options);
  };
};

/**
 * Chrome picks the port and reports it back through the profile, so parallel
 * workers cannot collide and nothing races between probing a port and binding it.
 */
export const coverageBrowserArgs = isCoverageEnabled
  ? ['--remote-debugging-port=0']
  : [];

/**
 * Playwright has no coverage API for a `Worker` and `newCDPSession` rejects
 * anything that is not a Page or Frame, so the background worker is reached
 * through the browser-level CDP endpoint. Keeping a debugger attached also stops
 * Chrome retiring the worker when idle, so one start/stop pair covers the run.
 */
const backgroundClients = new Map<BrowserContext, CoverageClient>();

export const attachBackgroundCoverage = async (
  context: BrowserContext,
  userDataDir: string
) => {
  if (!isCoverageEnabled) {
    return;
  }
  await safely(async () => {
    // Chrome lists no service_worker target for a moment after launch, and a
    // missed attach is never retried, so wait for the worker to register first
    const [worker] =
      context.serviceWorkers().length > 0
        ? context.serviceWorkers()
        : [await context.waitForEvent('serviceworker', { timeout: 30_000 })];
    const workerUrl = worker.url();
    const port = Number(
      fs
        .readFileSync(path.join(userDataDir, 'DevToolsActivePort'), 'utf8')
        .split('\n')[0]
    );
    const { CDPClient } = await import('monocart-coverage-reports');
    const client = await CDPClient({
      port,
      // Pages under test can register their own workers, so match this one's url
      target: (targets: { type: string; url: string }[]) =>
        targets.find(
          (target) =>
            target.type === 'service_worker' && target.url === workerUrl
        ),
    });
    if (client) {
      await client.startJSCoverage();
      backgroundClients.set(context, client);
    }
  });
};

const collectContextCoverage = async (context: BrowserContext) => {
  const client = backgroundClients.get(context);
  backgroundClients.delete(context);
  await Promise.all([
    ...context.pages().map((page) => collectPageCoverage(page)),
    client &&
      safely(async () => {
        await addCoverage((await client.stopJSCoverage()) ?? []);
      }),
  ]);
};

export const generateCoverageReport = async () => {
  if (!isCoverageEnabled) {
    return;
  }
  const coverageReport = await getReport();
  if (!coverageReport.hasCache()) {
    // Loud, because the whole mechanism silently rotting to zero looks identical
    // to a clean run in the job log
    console.error('::error::[coverage] no coverage data was collected');
    return;
  }
  await coverageReport.generate();
  console.info(
    `[coverage] report written to ${path.join(COVERAGE_OUTPUT_DIR, 'index.html')}`
  );
};
