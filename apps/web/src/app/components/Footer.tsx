import { GITHUB_REPO_URL } from '@bypass/shared';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { Suspense } from 'react';

import {
  BRAND,
  BRAND_MARK,
  CONTAINER,
  FOCUS_RING,
} from '@app/constants/landing';

import ReleaseDate from './ReleaseDate';

function Footer({
  releaseDate,
  extVersion,
}: {
  releaseDate: string;
  extVersion: string;
}) {
  return (
    <footer
      className={`${CONTAINER} max-landing-sm:flex-col max-landing-sm:items-start flex items-center justify-between gap-6.25 pt-7 pb-9 text-(length:--text-landing-13) text-muted-foreground`}
    >
      <div>
        <p
          className={`${BRAND} tracking-landing-brand-sm text-(length:--text-landing-38) text-foreground`}
        >
          <Image
            src="/bypass_link_192.png"
            alt=""
            height={56}
            width={56}
            className={BRAND_MARK}
          />
          Bypass Links
        </p>
        <p className="mt-2">links that behave like links again.</p>
      </div>
      <div className="max-landing-sm:items-start flex flex-col items-end gap-3">
        <div className="flex items-center gap-2.5">
          <span
            data-testid="ext-version"
            className="rounded-full border px-3 py-1.25 font-semibold text-foreground"
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
          className={`ease-landing inline-flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-primary transition-colors hover:border-primary focus-visible:rounded-sm motion-reduce:transition-none ${FOCUS_RING}`}
          aria-label="Github Repository Link"
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
