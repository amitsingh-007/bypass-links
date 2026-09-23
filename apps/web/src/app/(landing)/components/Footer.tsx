import { GITHUB_REPO_URL } from '@bypass/shared';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
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
    <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-5 pt-7 pb-9 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
      <div>
        <p className="font-display flex items-center gap-1.5 text-2xl leading-none font-extrabold tracking-tighter text-foreground sm:text-4xl">
          <Image
            src="/bypass_link_192.png"
            alt=""
            height={56}
            width={56}
            className="size-7 sm:size-10"
          />
          Bypass Links
        </p>
        <p className="mt-2">Bookmarks and browser tools for Chrome.</p>
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <div className="flex items-center gap-2.5">
          <span
            data-testid="ext-version"
            className="rounded-full border px-3 py-1 font-semibold text-foreground"
          >
            {`v${extVersion}`}
          </span>
          <span data-testid="ext-release-date">
            <Suspense fallback="Loading...">
              <ReleaseDate releaseDate={releaseDate} />
            </Suspense>
          </span>
        </div>
        <a
          target="_blank"
          href={GITHUB_REPO_URL}
          title="Bypass Links - Github"
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-primary transition-colors hover:border-primary dark:text-chart-1"
          rel="noreferrer"
        >
          <HugeiconsIcon icon={GithubIcon} size={16} />
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
