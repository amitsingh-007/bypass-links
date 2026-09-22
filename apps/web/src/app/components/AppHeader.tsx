'use client';

import { GITHUB_REPO_URL } from '@bypass/shared';
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

function AppHeader({ downloadLink }: { downloadLink: string }) {
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
          alt="Bypass Links"
          height={64}
          width={64}
        />
        <span>Bypass Links</span>
      </button>
      <nav className="landing-nav" aria-label="Sections">
        <a href="#features">Features</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="flex items-center gap-3">
        <div className="landing-pill">
          <a
            href={downloadLink}
            aria-label="Download for Chrome"
            className="landing-pill-primary"
          >
            Download
            <span aria-hidden="true">↓</span>
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Github Repository Link"
          >
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
