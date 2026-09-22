import { existsSync } from 'node:fs';
import { join } from 'node:path';

import Image from 'next/image';

import DownloadCta from './DownloadCta';

const POPUP_SHOT = '/shots/popup.png';

function PopupShot() {
  if (!existsSync(join(process.cwd(), 'public', POPUP_SHOT))) {
    return (
      <div
        role="img"
        aria-label="Preview of the Bypass Links popup"
        className="landing-window-shot landing-window-fallback landing-tint-coral"
      />
    );
  }

  return (
    <Image
      priority
      src={POPUP_SHOT}
      alt="The Bypass Links popup"
      height={624}
      width={620}
      className="landing-window-shot"
    />
  );
}

function PageHeader({ chrome }: { chrome: { downloadLink: string } }) {
  return (
    <section className="landing-container landing-hero">
      <div className="landing-hero-intro">
        <div>
          <h1 className="landing-h1">
            <span className="block">straight to the link</span>
            <span className="landing-accent block">you actually wanted</span>
          </h1>
          <p className="landing-subhead">
            bypass links walks past the timers, interstitials and ad gates on
            supported sites, then gets out of your way.
          </p>
        </div>
        <DownloadCta downloadLink={chrome.downloadLink} />
      </div>
      <div className="landing-window">
        <div className="landing-window-stage">
          <PopupShot />
        </div>
      </div>
      <p className="landing-window-caption">
        the popup, one click from the toolbar
      </p>
    </section>
  );
}

export default PageHeader;
