import { FEATURES } from '@app/constants/features';
import { CONTAINER, HEADING } from '@app/constants/landing';

const MINI =
  'flex w-full max-w-75 flex-col gap-2.75 rounded-xl border border-landing-card-line bg-landing-surface p-3.75 text-(length:--text-landing-13) leading-landing-mini shadow-(--landing-shadow-mini)';
const ROW = 'flex min-w-0 items-center gap-2.5';
const TITLE = 'min-w-0 flex-1 truncate font-semibold';
const FAVICON =
  'grid size-6 flex-none place-items-center rounded-landing-key text-xs leading-landing-mini font-bold';
const CHIP =
  'inline-flex flex-none items-center gap-1.5 rounded-full px-2.25 py-0.75 text-xs leading-landing-mini font-semibold';
const DIM = 'flex-none text-muted-foreground';
const RULE = 'h-px bg-landing-card-line';

const TONES = {
  violet: 'bg-primary text-landing-band-fg',
  coral: 'bg-secondary text-landing-band-fg',
  muted: 'bg-landing-soft text-muted-foreground',
};

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className: string;
}) {
  return (
    <span
      className={`grid size-5.5 place-items-center rounded-full border-2 text-(length:--text-landing-8) font-extrabold ${className}`}
    >
      {initials}
    </span>
  );
}

function GateArt() {
  return (
    <div className={MINI}>
      <div className={ROW}>
        <span className={`${FAVICON} ${TONES.muted}`}>↗</span>
        <span className={TITLE}>shrt.lk/x7q2</span>
        <span
          className={`${CHIP} bg-landing-soft text-muted-foreground line-through decoration-secondary decoration-(length:--landing-strike)`}
        >
          wait 15s
        </span>
      </div>
      <div className={RULE} />
      <div className={ROW}>
        <span className={`${FAVICON} ${TONES.violet}`}>F</span>
        <span className={TITLE}>field-notes.dev/guide</span>
      </div>
      <p className="leading-landing-mini flex items-center gap-1.75 pl-8.5 text-xs text-muted-foreground">
        <span className="bg-landing-tint-violet grid size-4 place-items-center rounded-full text-2xs font-extrabold text-primary">
          ✓
        </span>
        opened directly
      </p>
    </div>
  );
}

const BOOKMARK_ROWS = [
  { title: 'Mapping the night sky by hand', people: ['MC'] },
  { title: 'A field guide to CSS grid', people: ['MC', 'LA'] },
  { title: 'Twelve hikes worth the early start', people: ['MC', 'NP'] },
];

const AVATAR_TONES = [TONES.violet, TONES.coral];

function BookmarksArt() {
  return (
    <div className={MINI}>
      <span
        className={`${CHIP} bg-landing-tint-violet self-start pl-0.75 text-primary`}
      >
        <Avatar
          initials="MC"
          className={`border-landing-tint-violet ${TONES.violet}`}
        />
        Maya Chen
        <span className={DIM}>×</span>
      </span>
      {BOOKMARK_ROWS.map(({ title, people }) => (
        <div key={title} className={ROW}>
          <span className={`${FAVICON} ${TONES.muted}`}>{title[0]}</span>
          <span className={TITLE}>{title}</span>
          <span className="flex flex-none">
            {people.map((initials, index) => (
              <Avatar
                key={initials}
                initials={initials}
                className={`border-landing-surface ${AVATAR_TONES[index]} ${index > 0 ? '-ml-1.75' : ''}`}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

const SHORTCUTS = [
  { alias: 'g', site: 'github.com' },
  { alias: 'y', site: 'youtube.com' },
];

const SWITCHES = [
  { label: 'history', isOn: true },
  { label: 'autofill suggestions', isOn: false },
];

function ShortcutsArt() {
  return (
    <div className={MINI}>
      {SHORTCUTS.map(({ alias, site }) => (
        <div key={alias} className={ROW}>
          <kbd className="rounded-landing-key border-landing-line bg-landing-soft grid h-6.5 min-w-6.5 flex-none place-items-center border font-sans text-(length:--text-landing-13) font-bold shadow-(--landing-shadow-key)">
            {alias}
          </kbd>
          <span className={DIM}>→</span>
          <span className={TITLE}>{site}</span>
        </div>
      ))}
      <div className={RULE} />
      {SWITCHES.map(({ label, isOn }) => (
        <div key={label} className={ROW}>
          <span className={TITLE}>{label}</span>
          <span
            className={`after:bg-landing-band-fg relative h-4.5 w-7.5 flex-none rounded-full after:absolute after:top-0.5 after:size-3.5 after:rounded-full ${isOn ? 'bg-primary after:left-3.5' : 'bg-landing-line after:left-0.5'}`}
          />
        </div>
      ))}
    </div>
  );
}

const ART = {
  gate: GateArt,
  bookmarks: BookmarksArt,
  shortcuts: ShortcutsArt,
};

function SalientFeatures() {
  return (
    <section
      id="features"
      className={`${CONTAINER} border-landing-line max-landing-md:mt-14 max-landing-md:pt-15 max-landing-md:pb-17 mt-18 border-t pt-16 pb-25`}
    >
      <div className="max-landing-md:flex-col max-landing-md:items-start mb-9 flex items-end justify-between gap-6">
        <h2 className={HEADING}>
          <span className="block">what you get</span>
          <span className="block text-primary">out of the box</span>
        </h2>
        <p className="leading-landing-body max-w-77.5 pb-1 text-base text-muted-foreground">
          three things, built for the way a browser is actually used: get to the
          link, keep what matters, bend it to your habits.
        </p>
      </div>
      <div className="max-landing-md:grid-cols-1 max-landing-md:gap-4.5 grid grid-cols-3 gap-5.5">
        {FEATURES.map(({ art, title, content, tint }) => {
          const Art = ART[art];
          return (
            <div
              key={art}
              className="rounded-landing-card border-landing-card-line overflow-hidden border bg-card"
            >
              <div
                aria-hidden="true"
                className={`flex h-60 items-center justify-center p-6 ${tint}`}
              >
                <Art />
              </div>
              <div className="px-6.5 pt-6 pb-7">
                <h3 className="font-display leading-landing-feature tracking-landing-display mb-3 text-(length:--text-landing-feature) font-extrabold text-balance">
                  <span className="block">{title[0]}</span>
                  <span className="block">{title[1]}</span>
                </h3>
                <p className="leading-landing-card text-base text-muted-foreground">
                  {content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SalientFeatures;
