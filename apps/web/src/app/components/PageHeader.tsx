import { getLatestExtension } from '@bypass/trpc/edge';
import { ChromeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

// Only the download link needs the release, so the fetch stays here and the
// rest of the shell streams without waiting on GitHub.
export function PageHeaderSkeleton() {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="max-w-3xl text-5xl/tight font-bold md:text-6xl">
        Skip the Wait. Bypass Links Instantly.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Automate link bypassing, skip ads and captchas, and manage bookmarks
        with person tagging. All in one extension.
      </p>
      <div className="mt-10">
        <div className="h-11 w-56 rounded-lg bg-muted" />
      </div>
    </section>
  );
}

async function PageHeader() {
  const { chrome } = await getLatestExtension();

  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="max-w-3xl text-5xl/tight font-bold md:text-6xl">
        Skip the Wait. Bypass Links Instantly.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Automate link bypassing, skip ads and captchas, and manage bookmarks
        with person tagging. All in one extension.
      </p>
      <div className="mt-10">
        <a
          href={chrome.downloadLink}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-primary bg-clip-padding px-5 text-base font-semibold text-primary-foreground transition-all outline-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0"
        >
          <HugeiconsIcon icon={ChromeIcon} size={20} />
          Download for Chrome
        </a>
      </div>
    </section>
  );
}

export default PageHeader;
