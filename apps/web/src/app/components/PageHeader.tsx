import Image from 'next/image';

import { CONTAINER } from '@app/constants/landing';

import DownloadCta from './DownloadCta';

// No priority: a preloaded shot downloads even while its theme hides it
const THEMES = [
  { suffix: '', className: 'hidden dark:block' },
  { suffix: '-light', className: 'block dark:hidden' },
];

function BrowserWindow() {
  return (
    <div className="border-landing-line bg-landing-soft max-sm:rounded-landing-popup overflow-hidden rounded-2xl border shadow-(--landing-shadow-window)">
      <div className="flex h-11 items-end gap-4.5 px-4 max-sm:hidden">
        <span
          aria-hidden="true"
          className="*:bg-landing-line flex gap-1.75 self-center *:size-2.75 *:rounded-full"
        >
          <i />
          <i />
          <i />
        </span>
        <span className="bg-landing-surface flex h-8.5 w-50 min-w-0 items-center gap-2 rounded-t-lg px-3.5 text-(length:--text-landing-13) font-semibold">
          <Image src="/bypass_link_192.png" alt="" width={14} height={14} />
          Bookmarks
        </span>
      </div>
      <div className="border-landing-line bg-landing-surface flex items-center gap-3 border-b px-3 py-2 max-sm:hidden">
        <span className="bg-landing-soft min-w-0 flex-1 truncate rounded-full px-4 py-1.25 text-(length:--text-landing-13) text-muted-foreground">
          bypass-links / bookmarks
        </span>
        <span className="bg-landing-tint-violet grid size-7.5 flex-none place-items-center rounded-md shadow-(--landing-shadow-ext)">
          <Image src="/bypass_link_192.png" alt="" width={18} height={18} />
        </span>
      </div>
      <div className="bg-landing-panel max-sm:bg-landing-tint-violet relative h-95 overflow-hidden bg-(image:--landing-window-line) max-sm:flex max-sm:h-auto max-sm:justify-center max-sm:bg-none max-sm:px-2 max-sm:py-6">
        <div className="max-sm:hidden">
          {THEMES.map(({ suffix, className }) => (
            <Image
              key={suffix}
              src={`/shots/bookmarks${suffix}.png`}
              alt="The Bookmarks Panel"
              width={1600}
              height={1200}
              className={`h-95 w-200 max-w-none object-cover object-left-top ${className}`}
            />
          ))}
        </div>
        <div className="rounded-landing-popup bg-landing-panel before:border-landing-panel-line before:bg-landing-panel absolute top-2.75 right-3 w-77.5 shadow-(--landing-shadow-popup) before:absolute before:-top-1.5 before:right-2.25 before:size-3 before:rotate-45 before:border-t before:border-l max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:max-w-full max-sm:before:hidden">
          {THEMES.map(({ suffix, className }) => (
            <Image
              key={suffix}
              src={`/shots/popup${suffix}.png`}
              alt="The Bypass Links popup"
              width={620}
              height={624}
              className={`rounded-landing-popup relative h-auto w-full ${className}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ chrome }: { chrome: { downloadLink: string } }) {
  return (
    <section className={`${CONTAINER} max-landing-sm:pt-5 pt-8 pb-3`}>
      <div className="max-landing-lg:grid-cols-1 mb-9 grid grid-cols-[minmax(0,1fr)_520px] items-center gap-x-10">
        <h1 className="font-display leading-landing-hero tracking-landing-hero max-landing-sm:text-(length:--text-landing-hero-sm) text-(length:--text-landing-hero) font-extrabold">
          <span className="block">straight to the link</span>
          <span className="block text-primary">you actually wanted</span>
        </h1>
        <p className="leading-landing-body max-landing-sm:mt-3.5 max-landing-sm:text-base col-span-full mt-4.5 max-w-160 text-lg text-pretty text-muted-foreground">
          bypass links walks past the timers, interstitials and ad gates on
          supported sites, then gets out of your way.
        </p>
        <DownloadCta
          downloadLink={chrome.downloadLink}
          className="landing-lg:col-start-2 landing-lg:row-start-1 max-landing-lg:mt-7"
        />
      </div>
      <BrowserWindow />
      <p className="leading-landing-body mt-3 text-right text-sm text-muted-foreground">
        the popup, one click from the toolbar
      </p>
    </section>
  );
}

export default PageHeader;
