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
        className="flex h-[330px] w-[310px] items-center justify-center rounded-lg bg-primary/10"
      >
        <Image
          src="/bypass_link_192.png"
          alt=""
          height={72}
          width={72}
          className="rounded-xl opacity-70"
        />
      </div>
    );
  }

  return (
    <Image
      priority
      src={POPUP_SHOT}
      alt="The Bypass Links popup"
      height={330}
      width={310}
      className="rounded-lg"
    />
  );
}

function PageHeader({ chrome }: { chrome: { downloadLink: string } }) {
  return (
    <section className="flex flex-col items-center gap-12 py-16 text-center md:py-24">
      <div className="flex flex-col items-center gap-6">
        <h1 className="max-w-3xl text-4xl/tight font-bold lowercase sm:text-5xl/tight md:text-6xl/tight">
          <span className="block text-primary">straight to the link</span>
          <span className="block text-secondary">you actually wanted</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          bypass links walks past the timers, captchas and ad gates on supported
          sites, then gets out of your way.
        </p>
        <DownloadCta
          downloadLink={chrome.downloadLink}
          note="free and open source, for chrome"
        />
      </div>
      <div className="landing-shadow rounded-xl border border-border bg-card p-3">
        <PopupShot />
      </div>
    </section>
  );
}

export default PageHeader;
