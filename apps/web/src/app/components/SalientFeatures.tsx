import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import Image from 'next/image';

import { FEATURES } from '@app/constants/features';

function FeatureArt({
  icon,
  chips,
  chipFlow,
  shot,
}: {
  icon: IconSvgElement;
  chips?: [string, string];
  chipFlow?: boolean;
  shot?: { src: string; alt: string };
}) {
  if (shot && existsSync(join(process.cwd(), 'public', shot.src))) {
    return (
      <div className="landing-card-shot">
        <Image src={shot.src} alt={shot.alt} height={540} width={1640} />
      </div>
    );
  }

  return (
    <div className="landing-art">
      <span className="landing-art-icon">
        <HugeiconsIcon icon={icon} size={30} strokeWidth={1.8} />
      </span>
      {chips ? (
        <span className="landing-art-row">
          <span className="landing-chip">{chips[0]}</span>
          {chipFlow ? (
            <span aria-hidden="true" className="landing-art-arrow">
              →
            </span>
          ) : null}
          <span className="landing-chip">{chips[1]}</span>
        </span>
      ) : null}
    </div>
  );
}

function SalientFeatures() {
  return (
    <section id="features" className="landing-container landing-section">
      <div className="landing-section-head">
        <h2 className="landing-h2">
          <span className="block">what it</span>
          <span className="landing-accent block">actually does</span>
        </h2>
        <p className="landing-lede">
          three things, built for the way a browser is actually used: get to the
          link, keep what matters, hand nothing over.
        </p>
      </div>
      <div className="landing-grid">
        {FEATURES.map(
          ({ title, content, icon, tint, chips, chipFlow, shot }) => (
            <div key={title} className="landing-card">
              <div className={`landing-card-art ${tint}`}>
                <FeatureArt
                  icon={icon}
                  chips={chips}
                  chipFlow={chipFlow}
                  shot={shot}
                />
              </div>
              <div className="landing-card-body">
                <h3>{title}</h3>
                <p>{content}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default SalientFeatures;
