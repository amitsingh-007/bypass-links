interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: 'what does bypass links actually do?',
    answer:
      'it takes you straight to the real destination when a site puts a gate in front of it. countdown timers, interstitials and ad walls stop standing between you and the link, so a link behaves like a link again.',
  },
  {
    question: 'which sites are supported?',
    answer:
      'a curated list, covering the shorteners and forum gates people hit most. the extension keeps it up to date in the background, so new sites arrive without you updating anything. on anything not on the list it stays out of the way and the page loads normally. missing one? open an issue on github and it can be added.',
  },
  {
    question: 'is it free?',
    answer:
      'yes, and it always will be. mit licensed, no accounts to pay for, no tiers, no ads. the entire source is on github if you want to read it.',
  },
  {
    question: 'how do bookmarks and person tagging work?',
    answer:
      'one click saves the current tab into the bookmarks panel. you can attach one or more people to a bookmark, then filter your whole collection down to a single person later. people live in the persons panel with a name and a photo.',
  },
  {
    question: 'is my data private?',
    answer:
      'your bookmarks are encoded on your device before they sync, and the backend stores them in that form rather than as plain text. sync runs on a firebase backend the maintainer operates, and the account is plain google sign-in. nothing is sold, shared or analysed.',
  },
  {
    question: 'a site stopped working, what do i do?',
    answer:
      'sites change their gates without warning, so this happens. open an issue on github with the link you tried and it gets looked at.',
  },
  {
    question: 'does it work outside chrome?',
    answer:
      'chrome only today. other browsers are not ruled out, they are just not built yet.',
  },
  {
    question: 'will it slow my browsing down?',
    answer:
      'no. the extension sits idle until you land on a site it supports, so every other page loads exactly as it did before.',
  },
];
