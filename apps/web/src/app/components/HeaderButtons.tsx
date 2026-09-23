import { GITHUB_REPO_URL } from '@bypass/shared';

function HeaderButtons({ downloadLink }: { downloadLink: string }) {
  return (
    <div className="landing-header-buttons">
      <a
        href={downloadLink}
        aria-label="Download for Chrome"
        className="landing-btn landing-btn-sm"
      >
        Download
        <span aria-hidden="true">↓</span>
      </a>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github Repository Link"
        className="landing-btn landing-btn-sm"
      >
        GitHub
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export default HeaderButtons;
