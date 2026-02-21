import Image from 'next/image';
import { memo } from 'react';

interface IExtData {
  version: string;
  date: string;
  downloadLink: string;
}

interface Props {
  chrome: IExtData;
}

function DownloadButton({
  logo,
  text,
  downloadLink,
}: {
  logo: string;
  text: string;
  downloadLink: string;
}) {
  return (
    <a
      href={downloadLink}
      className="
        inline-flex items-center justify-center gap-2 rounded-full
        bg-linear-to-r from-[#6850ff] to-[#a750ff] px-6 py-3 text-base
        font-medium text-white transition-all
        hover:from-[#6850ff]/90 hover:to-[#a750ff]/90
      "
    >
      <Image src={logo} alt={text} height={22} width={22} />
      {text}
    </a>
  );
}

const PageHeader = memo<Props>(({ chrome }) => (
  <div className="mt-17.5 flex flex-col items-center">
    <h1
      className="
        text-center text-[2.1875rem] font-bold
        md:text-[2.8125rem]
      "
    >
      Have a Link Bypasser and private Bookmarks Panel !
    </h1>
    <div
      className="
        mt-2 flex flex-col gap-5
        md:mt-5 md:flex-row md:gap-[120px]
      "
    >
      <DownloadButton
        logo="chrome.svg"
        text="Download for Chrome"
        downloadLink={chrome.downloadLink}
      />
    </div>
  </div>
));

export default PageHeader;
