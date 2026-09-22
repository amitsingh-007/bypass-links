import {
  CollectionsBookmarkIcon,
  Link01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { type IconSvgElement } from '@hugeicons/react';

interface Feature {
  icon: IconSvgElement;
  title: string;
  content: string;
  tint: string;
  chips?: [string, string];
  chipFlow?: boolean;
  shot?: { src: string; alt: string };
}

export const FEATURES: Feature[] = [
  {
    icon: Link01Icon,
    title: 'skip the gate',
    content:
      'supported sites hand over the real destination, past the timers, interstitials and ad walls. on forums you see which links you have already opened, and your own shortcut rules jump straight to the sites you live on.',
    tint: 'landing-tint-violet',
    chips: ['shortened link', 'real destination'],
    chipFlow: true,
  },
  {
    icon: CollectionsBookmarkIcon,
    title: 'bookmarks with people on them',
    content:
      'a proper bookmarks panel, not a folder tree you dread. tag a link with a person and filter by them later. one click bookmarks the current tab, and last visited brings you back to where you left off.',
    tint: 'landing-tint-coral',
    shot: { src: '/shots/bookmarks.png', alt: 'The Bookmarks Panel' },
  },
  {
    icon: Shield01Icon,
    title: 'yours, and open',
    content:
      'your bookmarks are encoded on your device before they sync, and the backend stores them that way. history monitoring and autofill controls stay in your browser. mit licensed, all of it readable on github.',
    tint: 'landing-tint-sand',
    chips: ['encoded on device', 'mit licensed'],
  },
];
