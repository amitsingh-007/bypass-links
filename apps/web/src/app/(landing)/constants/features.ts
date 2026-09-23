interface Feature {
  title: [string, string];
  content: string;
  tint: string;
  rows: [lead: string, label: string, chip?: string][];
}

export const FEATURES: Feature[] = [
  {
    title: ['find links', 'by person'],
    content:
      'Save bookmarks in folders and tag them with the people they relate to. Filter your whole collection by anyone you have tagged. Pin opens the current tab ready to save.',
    tint: 'bg-tint-violet',
    rows: [
      ['M', 'Mapping the night sky by hand', 'MC'],
      ['A', 'A field guide to CSS grid', 'MC, LA'],
      ['T', 'Twelve hikes worth the early start', 'MC, NP'],
    ],
  },
  {
    title: ['shortcuts', 'you define'],
    content:
      'Map a short alias to a full address. When you open the alias, the extension redirects you to the site you set up.',
    tint: 'bg-tint-coral',
    rows: [
      ['g', 'github.com'],
      ['y', 'youtube.com'],
      ['m', 'mail.google.com'],
    ],
  },
  {
    title: ['forum tools', 'and history'],
    content:
      'On supported forums, the Forum button opens the links from the current page in their own tabs. The History switch clears browser history for the time it was monitoring.',
    tint: 'bg-tint-sand',
    rows: [
      ['F', 'Forum', 'open links'],
      ['H', 'History', 'on'],
    ],
  },
];
