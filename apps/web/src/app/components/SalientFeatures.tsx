import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import Image from 'next/image';

import { FEATURES } from '@app/constants/features';

function FeatureSlot({
  icon,
  shot,
}: {
  icon: IconSvgElement;
  shot?: { src: string; alt: string };
}) {
  if (shot && existsSync(join(process.cwd(), 'public', shot.src))) {
    return (
      <Image
        src={shot.src}
        alt={shot.alt}
        height={600}
        width={800}
        className="landing-shadow h-full w-full rounded-lg object-cover object-top"
      />
    );
  }

  return (
    <HugeiconsIcon
      icon={icon}
      size={72}
      className="text-primary/70"
      strokeWidth={1.5}
    />
  );
}

function SalientFeatures() {
  return (
    <section id="features" className="scroll-mt-20 py-16">
      <h2 className="mb-10 text-center text-3xl/tight font-bold lowercase md:text-4xl/tight">
        what it actually does
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {FEATURES.map(({ title, content, icon, tint, shot }) => (
          <div
            key={title}
            className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5"
          >
            <div
              className={`flex h-44 items-center justify-center overflow-hidden rounded-lg p-4 ${tint}`}
            >
              <FeatureSlot icon={icon} shot={shot} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold lowercase">{title}</h3>
              <p className="text-sm/relaxed text-muted-foreground">{content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SalientFeatures;
