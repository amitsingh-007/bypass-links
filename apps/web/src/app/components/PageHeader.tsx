import { existsSync } from 'node:fs';
import { join } from 'node:path';

import Image from 'next/image';

import DownloadCta from './DownloadCta';

function Shot({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) {
  if (!existsSync(join(process.cwd(), 'public', src))) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} landing-tint-violet`}
      />
    );
  }

  return (
    <Image
      priority
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

const THEMES = [
  { suffix: '', className: 'landing-shot-dark' },
  { suffix: '-light', className: 'landing-shot-light' },
];

function BrowserWindow() {
  return (
    <div className="landing-window">
      <div className="landing-window-tabs">
        <span aria-hidden="true" className="landing-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="landing-window-tab">
          <Image src="/bypass_link_192.png" alt="" width={14} height={14} />
          Bookmarks
        </span>
      </div>
      <div className="landing-window-toolbar">
        <span className="landing-window-address">bypass-links / bookmarks</span>
        <span className="landing-window-ext">
          <Image src="/bypass_link_192.png" alt="" width={18} height={18} />
        </span>
      </div>
      <div className="landing-window-body">
        {THEMES.map(({ suffix, className }) => (
          <Shot
            key={suffix}
            src={`/shots/bookmarks${suffix}.png`}
            alt="The Bookmarks Panel"
            width={1600}
            height={1200}
            className={`landing-window-page ${className}`}
          />
        ))}
        <div className="landing-window-popup">
          {THEMES.map(({ suffix, className }) => (
            <Shot
              key={suffix}
              src={`/shots/popup${suffix}.png`}
              alt="The Bypass Links popup"
              width={620}
              height={624}
              className={`landing-window-popup-shot ${className}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ chrome }: { chrome: { downloadLink: string } }) {
  return (
    <section className="landing-container landing-hero">
      <div className="landing-hero-intro">
        <h1 className="landing-h1">
          <span className="block">straight to the link</span>
          <span className="landing-accent block">you actually wanted</span>
        </h1>
        <p className="landing-subhead">
          bypass links walks past the timers, interstitials and ad gates on
          supported sites, then gets out of your way.
        </p>
        <DownloadCta downloadLink={chrome.downloadLink} />
      </div>
      <BrowserWindow />
      <p className="landing-window-caption">
        the popup, one click from the toolbar
      </p>
    </section>
  );
}

export default PageHeader;
