import { FEATURES } from '../constants/features';

function SalientFeatures() {
  return (
    <section
      id="features"
      className="mx-auto mt-14 max-w-7xl px-5 sm:px-8 lg:mt-18 lg:px-12"
    >
      <div className="border-t pt-16 pb-16 lg:pb-24">
        <div className="mb-9 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-4xl leading-none font-extrabold tracking-tighter md:text-5xl xl:text-6xl">
            <span className="block">what you get</span>
            <span className="block text-primary">out of the box</span>
          </h2>
          <p className="max-w-78 pb-1 text-muted-foreground">
            three things, built for the way a browser is actually used: get to
            the link, keep what matters, bend it to your habits.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {FEATURES.map(({ title, content, tint, rows }) => (
            <div
              key={title[0]}
              className="overflow-hidden rounded-3xl border bg-card"
            >
              <div
                aria-hidden="true"
                className={`flex h-60 items-center justify-center p-6 ${tint}`}
              >
                <ul className="w-full max-w-72 space-y-3 rounded-xl border bg-card p-4 text-xs shadow-lg shadow-black/5">
                  {rows.map(([lead, label, chip]) => (
                    <li key={label} className="flex items-center gap-2.5">
                      <span className="grid size-6 flex-none place-items-center rounded-md bg-muted font-bold text-muted-foreground">
                        {lead}
                      </span>
                      <span className="flex-1 truncate font-semibold">
                        {label}
                      </span>
                      {chip && (
                        <span className="bg-tint-violet rounded-full px-2 py-0.5 font-semibold text-primary">
                          {chip}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pt-6 pb-7">
                <h3 className="font-display mb-3 text-2xl leading-none font-extrabold tracking-tighter text-balance sm:text-3xl">
                  <span className="block">{title[0]}</span>
                  <span className="block">{title[1]}</span>
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SalientFeatures;
