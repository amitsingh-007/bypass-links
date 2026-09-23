import Image from 'next/image';

import DownloadCta from './DownloadCta';

// No priority: a preloaded shot downloads even while its theme hides it
const THEMES = [
  { suffix: '', className: 'hidden dark:block' },
  { suffix: '-light', className: 'dark:hidden' },
];

function BrowserWindow() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-muted shadow-xl shadow-black/5 dark:shadow-black/20">
      <div className="flex h-11 items-end gap-4 px-4 max-sm:hidden">
        <span
          aria-hidden="true"
          className="flex gap-2 self-center *:size-3 *:rounded-full *:bg-border"
        >
          <i />
          <i />
          <i />
        </span>
        <span className="flex h-8 w-50 items-center gap-2 rounded-t-lg bg-card px-3.5 text-sm font-semibold">
          <Image src="/bypass_link_192.png" alt="" width={14} height={14} />
          Bookmarks
        </span>
      </div>
      <div className="flex items-center gap-3 border-b bg-card px-3 py-2 max-sm:hidden">
        <span className="flex-1 truncate rounded-full bg-muted px-4 py-1 text-sm text-muted-foreground">
          bypass-links / bookmarks
        </span>
        <span className="bg-tint-violet grid size-8 place-items-center rounded-md ring-2 ring-primary ring-inset">
          <Image src="/bypass_link_192.png" alt="" width={18} height={18} />
        </span>
      </div>
      <div className="bg-tint-violet relative flex justify-center px-2 py-6 sm:block sm:h-95 sm:bg-white sm:p-0 dark:sm:bg-background">
        <div className="absolute inset-x-0 top-14 border-t border-foreground/10 max-sm:hidden" />
        <div className="relative max-sm:hidden">
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
        <div className="w-78 max-w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-foreground/10 sm:absolute sm:top-3 sm:right-3 dark:bg-background">
          {THEMES.map(({ suffix, className }) => (
            <Image
              key={suffix}
              src={`/shots/popup${suffix}.png`}
              alt="The Bypass Links popup"
              width={620}
              height={624}
              className={`h-auto w-full ${className}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-5 pb-3 sm:px-8 sm:pt-8 lg:px-12">
      <div className="mb-9 grid items-center gap-x-10 xl:grid-cols-[1fr_32rem]">
        <h1 className="font-display text-4xl leading-none font-extrabold tracking-tighter md:text-5xl xl:text-6xl">
          <span className="block">your bookmarks,</span>
          <span className="block text-primary">tagged with people</span>
        </h1>
        <p className="col-span-full mt-4 max-w-160 text-pretty text-muted-foreground sm:text-lg">
          A Chrome extension for bookmarks you can find by person, URL shortcuts
          you define, and tools for supported forums.
        </p>
        <DownloadCta
          downloadLink={downloadLink}
          className="mt-7 xl:col-start-2 xl:row-start-1 xl:mt-0"
        />
      </div>
      <BrowserWindow />
      <p className="mt-3 text-right text-sm text-muted-foreground">
        The popup and Bookmarks Panel, shown with sample data.
      </p>
    </section>
  );
}

export default PageHeader;
