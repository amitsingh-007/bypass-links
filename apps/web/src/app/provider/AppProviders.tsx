'use client';

import { swrConfig } from '@bypass/shared';
import { TooltipProvider } from '@bypass/ui';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { SWRConfig } from 'swr';

import { AuthProvider } from './AuthProvider';
import DynamicProvider from './DynamicProvider';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <SWRConfig value={swrConfig}>
        <TooltipProvider>
          <DynamicProvider>
            <AuthProvider>
              {children}
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </DynamicProvider>
        </TooltipProvider>
      </SWRConfig>
    </Suspense>
  );
}

export default AppProviders;
