import Image from 'next/image';

import { CONTAINER_WIDE } from '@app/constants/landing';

import BrandChevrons from './BrandChevrons';
import DownloadCta from './DownloadCta';

function DownloadBand({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="text-landing-band-fg max-landing-sm:pt-14 max-landing-sm:pb-16.25 relative overflow-hidden bg-primary pt-21.25 pb-22.5">
      <BrandChevrons className="max-landing-sm:top-4.5 max-landing-sm:-right-11.5 max-landing-sm:bottom-auto max-landing-sm:w-52.5 pointer-events-none absolute -right-9 -bottom-4.5 w-[min(440px,34vw)] -rotate-14 text-white/20" />
      <div className={`${CONTAINER_WIDE} relative`}>
        <Image
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
          className="mb-6.25"
        />
        <h2 className="font-display leading-landing-hero tracking-landing-display text-(length:--text-landing-band) font-extrabold">
          <span className="block">stop waiting</span>
          <span className="block">on the gate.</span>
          <span className="text-landing-sand block">install it now.</span>
        </h2>
        <DownloadCta invert downloadLink={downloadLink} className="mt-10" />
      </div>
    </section>
  );
}

export default DownloadBand;
