import {
  Bookmark02Icon,
  BubbleChatIcon,
  GithubIcon,
  Link01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import BrandChevrons from './BrandChevrons';

const INCLUDED = [
  {
    icon: Bookmark02Icon,
    tint: 'bg-tint-violet dark:text-chart-1',
    label: 'Bookmarks tagged with people',
  },
  {
    icon: Link01Icon,
    tint: 'bg-tint-coral dark:text-secondary',
    label: 'Custom URL shortcuts',
  },
  {
    icon: BubbleChatIcon,
    tint: 'bg-tint-sand dark:text-sand',
    label: 'Forum tools and history controls',
  },
  {
    icon: GithubIcon,
    tint: 'bg-tint-violet dark:text-chart-1',
    label: 'MIT licensed, source on GitHub',
  },
];

function FreeSection({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="bg-muted py-16 sm:py-20 dark:bg-card">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 className="font-display mb-8 text-center text-4xl leading-none font-extrabold tracking-tighter sm:mb-11 md:text-5xl xl:text-6xl">
          <span className="block">every feature included,</span>
          <span className="block text-secondary">nothing to pay for.</span>
        </h2>
        <div className="grid overflow-hidden rounded-4xl border bg-background lg:grid-cols-5">
          <div className="bg-sand text-sand-ink dark:bg-tint-violet dark:text-sand flex flex-col items-start px-6 py-8 sm:px-10 sm:py-11 lg:col-span-2">
            <p className="font-display text-6xl leading-none font-extrabold tracking-tighter xl:text-7xl">
              free,
              <br />
              for keeps.
            </p>
            <p className="mt-5 text-lg dark:text-white/80">
              No tiers, no trial, no ads.
            </p>
            <a
              href={downloadLink}
              className="mt-8 flex h-14 items-center gap-2.5 rounded-xl border-b-4 border-black/25 bg-primary px-5 font-semibold text-white hover:-translate-y-0.5 active:translate-y-0.5 motion-safe:transition-transform"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ↓
              </span>
              Download for Chrome
            </a>
          </div>
          <div className="px-6 py-8 sm:p-12 lg:col-span-3">
            <h3 className="font-display flex items-center gap-4 text-2xl leading-tight font-extrabold tracking-tighter sm:text-3xl">
              all in one popup
              <span
                aria-hidden="true"
                className="bg-sand text-sand-ink grid size-12 flex-none place-items-center rounded-full"
              >
                <BrandChevrons className="w-6" />
              </span>
            </h3>
            <ul className="mt-7 grid gap-4">
              {INCLUDED.map(({ icon, tint, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-4 font-medium sm:text-lg"
                >
                  <span
                    className={`grid size-9 flex-none place-items-center rounded-lg text-primary ${tint}`}
                  >
                    <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FreeSection;
