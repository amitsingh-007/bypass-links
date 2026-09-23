import { cn } from '@bypass/ui/lib/utils';
import { type ReactNode } from 'react';

import { manrope } from '@app/constants/font';
import { ROOT_METADATA, ROOT_VIEWPORT } from '@app/constants/metadata';
import AppProviders from '@app/provider/AppProviders';

import './layout.css';

export const viewport = ROOT_VIEWPORT;
export const metadata = ROOT_METADATA;

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn('dark', manrope.variable)}>
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

export default RootLayout;
