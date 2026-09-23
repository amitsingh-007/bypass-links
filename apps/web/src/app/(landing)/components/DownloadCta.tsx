import { GITHUB_REPO_URL } from '@bypass/shared';
import { cn } from '@bypass/ui/lib/utils';

function DownloadCta({
  downloadLink,
  invert,
  className,
}: {
  downloadLink: string;
  invert?: boolean;
  className?: string;
}) {
  const button = cn(
    'flex h-14 items-center justify-center gap-2.5 rounded-xl px-5 font-semibold whitespace-nowrap shadow-xs hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:shadow-2xs motion-safe:transition',
    invert
      ? 'bg-white text-primary shadow-white/40 focus-visible:outline-white'
      : 'shadow-ledge bg-primary text-white'
  );
  const note = cn(
    'mt-3 text-center text-xs sm:mt-4',
    invert ? 'text-white/75' : 'text-muted-foreground'
  );

  return (
    <div className={cn('grid max-w-lg gap-4 sm:grid-cols-2', className)}>
      <div>
        <a href={downloadLink} className={button}>
          <span aria-hidden="true" className="text-lg leading-none">
            ↓
          </span>
          Download for Chrome
        </a>
        <p className={note}>Desktop Chrome · ZIP download</p>
      </div>
      <div>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={button}
        >
          View on GitHub
          <span aria-hidden="true" className="text-lg leading-none">
            ↗
          </span>
        </a>
        <p className={note}>MIT licensed</p>
      </div>
    </div>
  );
}

export default DownloadCta;
