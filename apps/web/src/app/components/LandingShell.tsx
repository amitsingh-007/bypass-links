'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

function LandingShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="landing flex min-h-screen flex-col bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}

export default LandingShell;
