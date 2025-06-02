import { type Metadata } from 'next';
import { type ReactNode } from 'react';

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
