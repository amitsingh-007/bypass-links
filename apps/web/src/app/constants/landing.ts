// Plain strings, not cn(): cn reads font-landing-* as a font family and would drop font-display.
const GUTTERS =
  'mx-auto max-landing-md:w-[calc(100%-64px)] max-landing-sm:w-[calc(100%-40px)]';

export const CONTAINER = `w-[min(1240px,100%-96px)] ${GUTTERS}`;

export const CONTAINER_WIDE = `w-[min(1192px,100%-96px)] ${GUTTERS}`;

const FOCUS_OUTLINE = 'focus-visible:outline-3 focus-visible:outline-offset-5';

export const FOCUS_RING = `${FOCUS_OUTLINE} focus-visible:outline-primary`;

export const FOCUS_RING_ROUNDED = `${FOCUS_RING} focus-visible:rounded-sm`;

export const HEADING =
  'font-display text-(length:--text-landing-display) leading-landing-display font-extrabold tracking-landing-display';

export const BRAND =
  'group flex items-center gap-landing-brand font-display leading-none font-landing-brand max-landing-sm:text-(length:--text-landing-25) max-landing-sm:tracking-landing-brand-xs';

export const BRAND_MARK =
  'size-[1.15em] transition-transform duration-220 ease-landing group-hover:-translate-y-0.5 group-hover:-rotate-5 motion-reduce:transition-none';

const BUTTON_BASE = `inline-flex min-h-14.5 items-center justify-center gap-2.5 rounded-landing-btn px-4.5 py-4 text-base leading-landing-btn font-landing-btn whitespace-nowrap transition ease-landing hover:-translate-y-0.5 [@media(hover:hover)]:active:translate-y-0.75 motion-reduce:transition-none ${FOCUS_OUTLINE}`;

export const BUTTON = `${BUTTON_BASE} bg-primary text-landing-band-fg shadow-(--landing-shadow-btn) hover:shadow-(--landing-shadow-btn-hover) active:shadow-(--landing-shadow-btn-active) focus-visible:outline-primary`;

export const BUTTON_INVERT = `${BUTTON_BASE} bg-landing-band-fg text-primary shadow-(--landing-shadow-invert) hover:shadow-(--landing-shadow-invert-hover) focus-visible:outline-landing-band-fg active:shadow-(--landing-shadow-invert-active)`;

export const BUTTON_GLYPH = 'text-lg leading-none';
