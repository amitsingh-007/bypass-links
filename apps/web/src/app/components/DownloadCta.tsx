import { ChromeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

function DownloadCta({
  downloadLink,
  note,
}: {
  downloadLink: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={downloadLink}
        className="landing-shadow inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-colors outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <HugeiconsIcon icon={ChromeIcon} size={20} />
        Download for Chrome
      </a>
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export default DownloadCta;
