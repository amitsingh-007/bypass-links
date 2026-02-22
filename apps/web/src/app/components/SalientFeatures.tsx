import { firstColumn, secondColumn } from '@app/constants/features';
import { HugeiconsIcon } from '@hugeicons/react';

const allFeatures = [...firstColumn, ...secondColumn];

function SalientFeatures() {
  return (
    <section className="border-t py-16">
      <h2 className="mb-10 text-center text-2xl font-semibold">
        Core features at a glance
      </h2>
      <div
        className="
          grid grid-cols-1 gap-x-12 gap-y-8
          md:grid-cols-2
          lg:grid-cols-3
        "
      >
        {allFeatures.map(({ title, content, icon }) => (
          <div key={title} className="flex gap-4">
            <div className="shrink-0 text-primary">
              <HugeiconsIcon icon={icon} size={28} />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SalientFeatures;
