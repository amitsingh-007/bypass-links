interface Feature {
  title: [string, string];
  content: string;
  tint: string;
  rows: [lead: string, label: string, chip?: string][];
}

export const FEATURES: Feature[] = [
  {
    title: ['the gate', 'opens itself'],
    content:
      'on supported sites the timers, interstitials and ad walls are skipped for you. you land on the real destination, with nothing to click and nothing to wait out.',
    tint: 'bg-tint-violet',
    rows: [
      ['↗', 'shrt.lk/x7q2'],
      ['F', 'field-notes.dev/guide', 'opened directly'],
    ],
  },
  {
    title: ['bookmarks that', 'know people'],
    content:
      'a proper bookmarks panel, not a folder tree you dread. tag a link with the people it belongs to and filter by any of them later. one click saves the current tab.',
    tint: 'bg-tint-coral',
    rows: [
      ['M', 'Mapping the night sky by hand', 'MC'],
      ['A', 'A field guide to CSS grid', 'MC, LA'],
      ['T', 'Twelve hikes worth the early start', 'MC, NP'],
    ],
  },
  {
    title: ['tuned to how', 'you browse'],
    content:
      'write your own shortcut rules, so a short alias opens the site you live on. on supported forums, one click opens every new thread in its own tab. history gets a switch in the popup, and autofill suggestions stay off.',
    tint: 'bg-tint-sand',
    rows: [
      ['g', 'github.com'],
      ['y', 'youtube.com'],
      ['H', 'history', 'on'],
      ['A', 'autofill suggestions', 'off'],
    ],
  },
];
