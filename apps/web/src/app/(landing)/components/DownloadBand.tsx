import Image from 'next/image';

import BrandChevrons from './BrandChevrons';
import DownloadCta from './DownloadCta';

function DownloadBand({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-white sm:py-22">
      <BrandChevrons className="pointer-events-none absolute top-4 -right-12 w-52 -rotate-12 text-white/20 sm:top-auto sm:-right-9 sm:-bottom-5 sm:w-1/3 sm:max-w-md" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Image
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
          className="mb-6"
        />
        <h2 className="font-display text-5xl leading-none font-extrabold tracking-tighter md:text-6xl xl:text-7xl">
          <span className="block">save the link.</span>
          <span className="block">tag the people.</span>
          <span className="text-sand block">find it later.</span>
        </h2>
        <DownloadCta invert downloadLink={downloadLink} className="mt-10" />
      </div>
    </section>
  );
}

export default DownloadBand;
