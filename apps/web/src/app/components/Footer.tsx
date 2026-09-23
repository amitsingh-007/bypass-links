import { GITHUB_REPO_URL } from '@bypass/shared';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { Suspense } from 'react';

import HeaderButtons from './HeaderButtons';
import ReleaseDate from './ReleaseDate';

function Footer({
  releaseDate,
  extVersion,
  downloadLink,
}: {
  releaseDate: string;
  extVersion: string;
  downloadLink: string;
}) {
  return (
    <footer className="landing-container landing-footer">
      <div>
        <p className="landing-brand landing-brand-sm">
          <Image src="/bypass_link_192.png" alt="" height={56} width={56} />
          Bypass Links
        </p>
        <p className="mt-2">links that behave like links again.</p>
      </div>
      <div className="landing-footer-right">
        <HeaderButtons downloadLink={downloadLink} />
        <div className="landing-footer-meta">
          <span data-testid="ext-version" className="landing-version">
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
          className="landing-footer-link"
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
