'use client';

import { GITHUB_REPO_URL } from '@bypass/shared';
import {
  ChromeIcon,
  GithubIcon,
  Moon02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import { WEB_ROUTES } from '@app/constants/routes';

const iconButtonClass =
  'flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      className={iconButtonClass}
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
    >
      <HugeiconsIcon icon={Sun03Icon} size={16} className="hidden dark:block" />
      <HugeiconsIcon icon={Moon02Icon} size={16} className="dark:hidden" />
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <button
          type="button"
          className="group flex items-center gap-3"
          onClick={handleLogoClick}
        >
          <div className="rounded-lg bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
            <Image
              priority
              src="/bypass_link_192.png"
              alt="Bypass Links"
              height={24}
              width={24}
              className="rounded-md"
            />
          </div>
          <span className="font-display text-base font-bold tracking-tight whitespace-nowrap">
            Bypass Links
          </span>
        </button>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Github Repository Link"
            className={iconButtonClass}
          >
            <HugeiconsIcon icon={GithubIcon} size={16} />
          </a>
          <ThemeToggle />
          <a
            href={downloadLink}
            aria-label="Download for Chrome"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 sm:px-4"
          >
            <HugeiconsIcon icon={ChromeIcon} size={16} />
            <span className="hidden sm:inline">Download for Chrome</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
