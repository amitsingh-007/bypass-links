import { GITHUB_REPO_URL } from '@bypass/shared';
import {
  Calendar03Icon,
  GithubIcon,
  PuzzleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { headers } from 'next/headers';

// Footer reads per-request headers (timezone), so it streams inside a
// <Suspense> boundary; this placeholder reserves its height meanwhile.
export function FooterSkeleton() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="h-12" />
      </div>
    </footer>
  );
}

function Info({
  icon,
  text,
  testId,
}: {
  icon: typeof GithubIcon;
  text: string;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-2" data-testid={testId}>
      <HugeiconsIcon icon={icon} size={20} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

async function Footer({
  releaseDate,
  extVersion,
}: {
  releaseDate: string;
  extVersion: string;
}) {
  const headersList = await headers();
  const tz = headersList.get('x-vercel-ip-timezone') ?? undefined;

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
        <div className="flex flex-col gap-2">
          <Info
            icon={PuzzleIcon}
            text={`v${extVersion}`}
            testId="ext-version"
          />
          <Info
            icon={Calendar03Icon}
            text={new Intl.DateTimeFormat('en-GB', {
              timeZone: tz,
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date(releaseDate))}
            testId="ext-release-date"
          />
        </div>
        <a
          target="_blank"
          href={GITHUB_REPO_URL}
          title="Bypass Links - Github"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
          aria-label="Github Repository Link"
          rel="noreferrer"
        >
          <HugeiconsIcon icon={GithubIcon} size={24} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
