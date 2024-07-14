import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Bookmarks Panel',
  robots: {
    follow: false,
    index: false,
  },
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return children;
};

export default Layout;
