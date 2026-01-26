import ForumIcon from '@app/icons/forum.svg';
import GraphIcon from '@app/icons/graph.svg';
import HandshakeIcon from '@app/icons/handshake.svg';
import PalmIcon from '@app/icons/palm.svg';
import SecurityIcon from '@app/icons/security.svg';
import type Feature from '../components/types/feature';

export const firstColumn: Feature[] = [
  {
    icon: HandshakeIcon,
    altIconText: 'circle-logo',
    title: 'Easy to use',
    content: 'Easy to use and straight-forward user interface to operate on',
  },
  {
    icon: PalmIcon,
    altIconText: 'palm-logo',
    title: 'Automate Browser Actions',
    content:
      'Automate some browser actions like history monitor, turn off autofill, etc',
  },
  {
    icon: ForumIcon,
    altIconText: 'forum-logo',
    title: 'Forum Surfing Support',
    content: 'Surf supported forums and open unvisited links',
  },
];

export const secondColumn: Feature[] = [
  {
    icon: SecurityIcon,
    altIconText: 'security-logo',
    title: 'Enhanced Privacy',
    content:
      'All data is first encoded at user device before sending to the server',
  },
  {
    icon: GraphIcon,
    altIconText: 'graph-logo',
    title: 'Continuously Updated',
    content:
      'Continuously updated with new features and also fixing vulnerabilities',
  },
];
