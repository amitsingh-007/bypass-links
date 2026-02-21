'use client';

import { TooltipProvider } from '@bypass/ui';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode, Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from './AuthProvider';
import DynamicProvider from './DynamicProvider';

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <StrictMode>
        <TooltipProvider>
          <DynamicProvider>
            <AuthProvider>
              {children}
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </DynamicProvider>
        </TooltipProvider>
      </StrictMode>
    </Suspense>
  );
}

export default AppProviders;
