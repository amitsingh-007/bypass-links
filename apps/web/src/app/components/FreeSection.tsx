import {
  Bookmark02Icon,
  GithubIcon,
  Link01Icon,
  LaptopIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import {
  BUTTON,
  BUTTON_GLYPH,
  CONTAINER_WIDE,
  HEADING,
} from '@app/constants/landing';

import BrandChevrons from './BrandChevrons';

const PERK_VIOLET =
  'bg-landing-tint-violet dark:bg-landing-perk-violet dark:text-landing-perk-violet-ink';

const INCLUDED = [
  {
    icon: Link01Icon,
    tint: PERK_VIOLET,
    label: 'skips gates on supported sites',
  },
  {
    icon: Bookmark02Icon,
    tint: 'bg-landing-tint-coral dark:bg-landing-perk-coral dark:text-landing-perk-coral-ink',
    label: 'bookmarks and persons, synced',
  },
  {
    icon: LaptopIcon,
    tint: 'bg-landing-tint-sand dark:bg-landing-perk-sand dark:text-landing-sand',
    label: 'encoded on your device before sync',
  },
  {
    icon: GithubIcon,
    tint: PERK_VIOLET,
    label: 'mit licensed, source on github',
  },
];

function FreeSection({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="bg-landing-free-bg max-landing-sm:py-15 py-19">
      <div className={CONTAINER_WIDE}>
        <h2
          className={`${HEADING} max-landing-sm:mb-8 max-landing-sm:text-(length:--text-landing-display-sm) mb-11 text-center`}
        >
          <span className="block">every feature included,</span>
          <span className="block text-secondary">nothing to pay for.</span>
        </h2>
        <div className="border-landing-line max-landing-md:grid-cols-1 grid grid-cols-[0.85fr_1.15fr] overflow-hidden rounded-4xl border bg-background">
          <div className="bg-landing-stub text-landing-stub-ink max-landing-sm:px-6.5 max-landing-sm:py-8 flex flex-col items-start px-10.5 pt-11 pb-11.5 dark:bg-(image:--landing-stub-glow)">
            <p className="font-display leading-landing-ticket-big tracking-landing-ticket-big text-(length:--text-landing-ticket) font-extrabold">
              free,
              <br />
              for keeps.
            </p>
            <p className="dark:text-landing-band-fg/78 mt-5 text-(length:--text-landing-17)">
              no tiers, no trial, no ads. install it and it is yours.
            </p>
            <a href={downloadLink} className={`${BUTTON} mt-8`}>
              <span aria-hidden="true" className={BUTTON_GLYPH}>
                ↓
              </span>
              Download for Chrome
            </a>
          </div>
          <div className="max-landing-sm:px-6.5 max-landing-sm:py-8 px-12 py-12.5">
            <h3 className="font-display leading-landing-ticket tracking-landing-ticket max-landing-sm:text-2xl flex items-center gap-4 text-3xl font-extrabold">
              all of it, for everyone
              <span
                aria-hidden="true"
                className="bg-landing-sand text-landing-seal-ink grid size-12 flex-none place-items-center rounded-full"
              >
                <BrandChevrons className="w-6.5" />
              </span>
            </h3>
            <ul className="mt-7 grid gap-4.5">
              {INCLUDED.map(({ icon, tint, label }) => (
                <li
                  key={label}
                  className="max-landing-sm:text-(length:--text-landing-15) flex items-center gap-4 text-(length:--text-landing-17) font-medium"
                >
                  <span
                    className={`grid size-9.5 flex-none place-items-center rounded-lg text-primary ${tint}`}
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
