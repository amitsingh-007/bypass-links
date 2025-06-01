'use client';

import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode, Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from './AuthProvider';
import DynamicProvider from './DynamicProvider';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <StrictMode>
        <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
          <DynamicProvider>
            <AuthProvider>
              {children}
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </DynamicProvider>
        </MantineProvider>
      </StrictMode>
    </Suspense>
  );
}

export default AppProviders;
