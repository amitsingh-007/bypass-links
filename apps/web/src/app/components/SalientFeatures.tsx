import { FEATURES } from '@app/constants/features';

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return <span className={`landing-mini-avatar ${tone}`}>{initials}</span>;
}

function GateArt() {
  return (
    <div className="landing-mini">
      <div className="landing-mini-row">
        <span className="landing-mini-favicon landing-tone-muted">↗</span>
        <span className="landing-mini-title">shrt.lk/x7q2</span>
        <span className="landing-mini-chip landing-mini-struck">wait 15s</span>
      </div>
      <div className="landing-mini-rule" />
      <div className="landing-mini-row">
        <span className="landing-mini-favicon landing-tone-violet">F</span>
        <span className="landing-mini-title">field-notes.dev/guide</span>
      </div>
      <p className="landing-mini-meta">
        <span className="landing-mini-check">✓</span>
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

const AVATAR_TONES = ['landing-tone-violet', 'landing-tone-coral'];

function BookmarksArt() {
  return (
    <div className="landing-mini">
      <span className="landing-mini-chip landing-mini-filter">
        <Avatar initials="MC" tone="landing-tone-violet" />
        Maya Chen
        <span className="landing-mini-dim">×</span>
      </span>
      {BOOKMARK_ROWS.map(({ title, people }) => (
        <div key={title} className="landing-mini-row">
          <span className="landing-mini-favicon landing-tone-muted">
            {title[0]}
          </span>
          <span className="landing-mini-title">{title}</span>
          <span className="landing-mini-avatars">
            {people.map((initials, index) => (
              <Avatar
                key={initials}
                initials={initials}
                tone={AVATAR_TONES[index]}
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
    <div className="landing-mini">
      {SHORTCUTS.map(({ alias, site }) => (
        <div key={alias} className="landing-mini-row">
          <kbd className="landing-mini-key">{alias}</kbd>
          <span className="landing-mini-dim">→</span>
          <span className="landing-mini-title">{site}</span>
        </div>
      ))}
      <div className="landing-mini-rule" />
      {SWITCHES.map(({ label, isOn }) => (
        <div key={label} className="landing-mini-row">
          <span className="landing-mini-title">{label}</span>
          <span className="landing-mini-switch" data-on={isOn} />
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
    <section id="features" className="landing-container landing-section">
      <div className="landing-section-head">
        <h2 className="landing-h2">
          <span className="block">what you get</span>
          <span className="landing-accent block">out of the box</span>
        </h2>
        <p className="landing-lede">
          three things, built for the way a browser is actually used: get to the
          link, keep what matters, bend it to your habits.
        </p>
      </div>
      <div className="landing-grid">
        {FEATURES.map(({ art, title, content, tint }) => {
          const Art = ART[art];
          return (
            <div key={art} className="landing-card">
              <div aria-hidden="true" className={`landing-card-art ${tint}`}>
                <Art />
              </div>
              <div className="landing-card-body">
                <h3>
                  <span className="block">{title[0]}</span>
                  <span className="block">{title[1]}</span>
                </h3>
                <p>{content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SalientFeatures;
