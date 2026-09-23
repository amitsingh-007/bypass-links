import { GITHUB_REPO_URL } from '@bypass/shared';

import { BUTTON, BUTTON_GLYPH, BUTTON_INVERT } from '@app/constants/landing';

function DownloadCta({
  downloadLink,
  invert,
  className = '',
}: {
  downloadLink: string;
  invert?: boolean;
  className?: string;
}) {
  const buttonClass = `${invert ? BUTTON_INVERT : BUTTON} w-full`;
  const noteClass = `mt-4 text-center text-(length:--text-landing-13) leading-normal max-landing-sm:mt-3 ${invert ? 'text-landing-band-fg/75' : 'text-muted-foreground'}`;

  return (
    <div
      className={`max-landing-xs:grid-cols-1 max-landing-xs:gap-3.5 grid w-[min(100%,520px)] grid-cols-2 gap-4.5 ${className}`}
    >
      <div>
        <a href={downloadLink} className={buttonClass}>
          <span aria-hidden="true" className={BUTTON_GLYPH}>
            ↓
          </span>
          Download for Chrome
        </a>
        <p className={noteClass}>free and open source, for chrome</p>
      </div>
      <div>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          View on GitHub
          <span aria-hidden="true" className={BUTTON_GLYPH}>
            ↗
          </span>
        </a>
        <p className={noteClass}>mit licensed, source on github</p>
      </div>
    </div>
  );
}

export default DownloadCta;
