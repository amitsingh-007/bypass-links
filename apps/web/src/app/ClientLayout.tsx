'use client';

import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { StrictMode, Suspense } from 'react';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <StrictMode>
        <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
          <DynamicProvider>
            <AuthProvider>
              {children}
              <Analytics />
            </AuthProvider>
          </DynamicProvider>
        </MantineProvider>
      </StrictMode>
    </Suspense>
  );
};

export default ClientLayout;
