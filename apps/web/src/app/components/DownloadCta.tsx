import { GITHUB_REPO_URL } from '@bypass/shared';
import { cn } from '@bypass/ui/lib/utils';

function DownloadCta({
  downloadLink,
  invert,
}: {
  downloadLink: string;
  invert?: boolean;
}) {
  const buttonClass = cn('landing-btn', invert && 'landing-btn-invert');

  return (
    <div className="landing-cta-pair">
      <div>
        <a href={downloadLink} className={buttonClass}>
          <span aria-hidden="true" className="landing-btn-glyph">
            ↓
          </span>
          Download for Chrome
        </a>
        <p className="landing-note">free and open source, for chrome</p>
      </div>
      <div>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          View on GitHub
          <span aria-hidden="true" className="landing-btn-glyph">
            ↗
          </span>
        </a>
        <p className="landing-note">mit licensed, source on github</p>
      </div>
    </div>
  );
}

export default DownloadCta;
