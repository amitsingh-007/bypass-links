import { GITHUB_REPO_URL } from '@bypass/shared';

interface Faq {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

export const FAQS: Faq[] = [
  {
    question: 'What does Bypass Links do?',
    answer:
      'It is a Chrome extension for keeping and finding links. Save bookmarks in folders, tag them with people, set up URL shortcuts, and open links from supported forum pages in their own tabs.',
  },
  {
    question: 'Can I sign up?',
    answer:
      'Not right now. Bypass Links is not open to new sign-ups. Bookmarks, people, shortcuts and forum tools need an existing account, which signs in with Google.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. There are no tiers and no ads, and the source is on GitHub under the MIT license.',
  },
  {
    question: 'How do bookmarks and person tagging work?',
    answer:
      'Choose Pin in the popup to open the current tab in the bookmark form. Pick a folder, tag the people it relates to, and save. You can then filter your whole collection by any person. People live in the Persons Panel with a name and a photo.',
  },
  {
    question: 'What data does it collect?',
    answer:
      'The extension has no analytics or tracking. Your bookmarks and people sync to the Bypass Links backend under your Google account, and bookmark titles and URLs are encoded on your device before they upload.',
  },
  {
    question: 'Which forums are supported?',
    answer:
      'The forum tools work on a set of configured forums, loaded when you sign in. What they can open depends on the forum and the type of page.',
  },
  {
    question: 'What does the History switch do?',
    answer:
      'While History monitoring is on, turning the switch off clears your browser history for that period, starting 30 seconds before monitoring began. Opening forum links or following a shortcut turns monitoring on.',
  },
  {
    question: 'How do I install it?',
    answer:
      'The download is a ZIP file. Unzip it, open chrome://extensions, turn on Developer mode, choose Load unpacked, and select the unzipped folder.',
  },
  {
    question: 'Does it work outside Chrome?',
    answer: 'No. The download is an extension for desktop Chrome.',
  },
  {
    question: 'Something is not working. What should I do?',
    answer:
      'Open an issue with the steps to reproduce it. Please leave out any private links.',
    link: {
      href: `${GITHUB_REPO_URL}/issues`,
      label: 'Report a problem on GitHub',
    },
  },
];
