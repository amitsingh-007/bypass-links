import Image from 'next/image';

import DownloadCta from './DownloadCta';

function DownloadBand({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="landing-band">
      <span aria-hidden="true" className="landing-band-glyph">
        »
      </span>
      <div className="landing-container-wide landing-band-inner">
        <Image
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
          className="landing-band-mark"
        />
        <h2 className="landing-band-title">
          <span className="block">stop waiting</span>
          <span className="block">on the gate.</span>
          <span className="landing-band-accent block">install it now.</span>
        </h2>
        <DownloadCta invert downloadLink={downloadLink} />
      </div>
    </section>
  );
}

export default DownloadBand;
