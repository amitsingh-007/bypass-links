import {
  CollectionsBookmarkIcon,
  CommandIcon,
  ComputerIcon,
  Link01Icon,
  Shield01Icon,
  Touch01Icon,
} from '@hugeicons/core-free-icons';
import type Feature from '../components/types/feature';

export const firstColumn: Feature[] = [
  {
    icon: Touch01Icon,
    title: 'Simple to Use',
    content:
      'Clean, straightforward interface that is easy to set up and navigate',
  },
  {
    icon: ComputerIcon,
    title: 'Browser Utility Controls',
    content:
      'Automate history tracking and turn off autofill on specific websites to reduce clutter',
  },
  {
    icon: Link01Icon,
    title: 'Forum Link Tracking',
    content:
      'Browse supported forums and open only links you have not visited yet',
  },
];

export const secondColumn: Feature[] = [
  {
    icon: Shield01Icon,
    title: 'Privacy-First Sync',
    content:
      'Your data is encoded on your device before it is sent to the server',
  },
  {
    icon: CollectionsBookmarkIcon,
    title: 'Bookmarks & Person Tagging',
    content:
      'Full-featured bookmarks panel with person tagging to organize and filter by people',
  },
  {
    icon: CommandIcon,
    title: 'Custom Shortcut Rules',
    content:
      'Create personalized shortcut rules for frequently visited websites and launch them quickly',
  },
];
