import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { NOINDEX_ROBOTS } from '@app/constants/metadata';

export const metadata: Metadata = {
  title: 'Persons Panel',
  robots: NOINDEX_ROBOTS,
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => children;

export default Layout;
