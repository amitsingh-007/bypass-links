'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode, useEffect } from 'react';

function LandingShell({ children }: { children: ReactNode }) {
  // next-themes leaves its class on <html> when unmounted; the panels expect the server-rendered dark
  useEffect(
    () => () => {
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.removeProperty('color-scheme');
    },
    []
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="landing leading-landing-body flex min-h-screen flex-col bg-background text-base text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}

export default LandingShell;
