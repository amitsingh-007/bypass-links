import {
  ArrowRightDoubleIcon,
  Bookmark02Icon,
  GithubIcon,
  Link01Icon,
  LaptopIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const INCLUDED = [
  {
    icon: Link01Icon,
    tint: 'landing-perk-violet',
    label: 'skips gates on supported sites',
  },
  {
    icon: Bookmark02Icon,
    tint: 'landing-perk-coral',
    label: 'bookmarks and persons, synced',
  },
  {
    icon: LaptopIcon,
    tint: 'landing-perk-sand',
    label: 'encoded on your device before sync',
  },
  {
    icon: GithubIcon,
    tint: 'landing-perk-violet',
    label: 'mit licensed, source on github',
  },
];

function FreeSection({ downloadLink }: { downloadLink: string }) {
  return (
    <section className="landing-free">
      <div className="landing-container-wide">
        <h2 className="landing-h2 landing-free-title">
          <span className="block">every feature included,</span>
          <span className="landing-free-accent block">nothing to pay for.</span>
        </h2>
        <div className="landing-ticket">
          <div className="landing-ticket-stub">
            <p className="landing-ticket-big">
              free,
              <br />
              for keeps.
            </p>
            <p className="landing-ticket-line">
              no tiers, no trial, no ads. install it and it is yours.
            </p>
            <a href={downloadLink} className="landing-btn">
              <span aria-hidden="true" className="landing-btn-glyph">
                ↓
              </span>
              Download for Chrome
            </a>
          </div>
          <div className="landing-ticket-list">
            <h3>
              all of it, for everyone
              <span aria-hidden="true" className="landing-ticket-seal">
                <HugeiconsIcon
                  icon={ArrowRightDoubleIcon}
                  size={24}
                  strokeWidth={2.2}
                />
              </span>
            </h3>
            <ul>
              {INCLUDED.map(({ icon, tint, label }) => (
                <li key={label}>
                  <span className={`landing-ticket-icon ${tint}`}>
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
