import { ChromeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

interface IExtData {
  version: string;
  date: string;
  downloadLink: string;
}

interface Props {
  icon: IconSvgElement;
  text: string;
  downloadLink: string;
}

function DownloadButton({ icon, text, downloadLink }: Props) {
  return (
    <a
      href={downloadLink}
      className="
        inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg
        border border-transparent bg-primary bg-clip-padding px-5 text-base
        font-semibold text-primary-foreground transition-all outline-none
        hover:bg-primary/80
        focus-visible:border-ring focus-visible:ring-3
        focus-visible:ring-ring/50
        [&_svg]:pointer-events-none [&_svg]:shrink-0
      "
    >
      <HugeiconsIcon icon={icon} size={20} />
      {text}
    </a>
  );
}

function PageHeader({ chrome }: { chrome: IExtData }) {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <h1
        className="
          max-w-3xl text-5xl/tight font-bold
          md:text-6xl
        "
      >
        Skip the Wait. Bypass Links Instantly.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Automate link bypassing, skip ads and captchas, and manage bookmarks
        with person tagging. All in one extension.
      </p>
      <div className="mt-10">
        <DownloadButton
          icon={ChromeIcon}
          text="Download for Chrome"
          downloadLink={chrome.downloadLink}
        />
      </div>
    </section>
  );
}

export default PageHeader;
