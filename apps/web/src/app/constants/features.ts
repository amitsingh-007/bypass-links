interface Feature {
  art: 'gate' | 'bookmarks' | 'shortcuts';
  title: [string, string];
  content: string;
  tint: string;
}

export const FEATURES: Feature[] = [
  {
    art: 'gate',
    title: ['the gate', 'opens itself'],
    content:
      'on supported sites the timers, interstitials and ad walls are skipped for you. you land on the real destination, with nothing to click and nothing to wait out.',
    tint: 'bg-landing-tint-violet',
  },
  {
    art: 'bookmarks',
    title: ['bookmarks that', 'know people'],
    content:
      'a proper bookmarks panel, not a folder tree you dread. tag a link with the people it belongs to and filter by any of them later. one click saves the current tab.',
    tint: 'bg-landing-tint-coral',
  },
  {
    art: 'shortcuts',
    title: ['tuned to how', 'you browse'],
    content:
      'write your own shortcut rules, so a short alias opens the site you live on. on supported forums, one click opens every new thread in its own tab. history gets a switch in the popup, and autofill suggestions stay off.',
    tint: 'bg-landing-tint-sand',
  },
];
