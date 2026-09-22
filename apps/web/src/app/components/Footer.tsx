import { GITHUB_REPO_URL } from '@bypass/shared';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Suspense } from 'react';

import ReleaseDate from './ReleaseDate';

function Footer({
  releaseDate,
  extVersion,
}: {
  releaseDate: string;
  extVersion: string;
}) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <span
            data-testid="ext-version"
            className="rounded-full border border-border bg-card px-3 py-1 font-medium"
          >
            {`v${extVersion}`}
          </span>
          <span
            data-testid="ext-release-date"
            className="text-muted-foreground"
          >
            <Suspense fallback="Loading...">
              <ReleaseDate releaseDate={releaseDate} />
            </Suspense>
          </span>
        </div>
        <a
          target="_blank"
          href={GITHUB_REPO_URL}
          title="Bypass Links - Github"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/30"
          aria-label="Github Repository Link"
          rel="noreferrer"
        >
          <HugeiconsIcon icon={GithubIcon} size={18} />
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
