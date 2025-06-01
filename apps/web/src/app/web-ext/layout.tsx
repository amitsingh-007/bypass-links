import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Web',
  robots: {
    follow: false,
    index: false,
  },
};

const Layout = async ({ children }: { children: ReactNode }) => {
  return children;
};

export default Layout;
