'use client';

import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import { WEB_ROUTES } from '@app/constants/routes';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={resolvedTheme === 'dark'}
      title="Toggle theme"
      className="landing-theme-toggle"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
    >
      <HugeiconsIcon icon={Sun03Icon} size={18} className="hidden dark:block" />
      <HugeiconsIcon icon={Moon02Icon} size={18} className="dark:hidden" />
    </button>
  );
}

function AppHeader() {
  const router = useRouter();
  const clickCount = useRef(0);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickCount.current === 5) {
      router.push(WEB_ROUTES.BYPASS_LINKS_WEB);
    }
  };

  return (
    <header className="landing-container landing-header">
      <button type="button" className="landing-brand" onClick={handleLogoClick}>
        <Image
          priority
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
        />
        <span>Bypass Links</span>
      </button>
      <div className="landing-header-actions">
        <nav className="landing-nav" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
