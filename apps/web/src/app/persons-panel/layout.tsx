import { type Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Persons Panel',
  robots: {
    follow: false,
    index: false,
  },
};

const Layout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  return children;
};

export default Layout;
