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
      title="Toggle theme"
      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
    <header className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:h-28 sm:px-8 lg:px-12">
      <button
        type="button"
        className="group font-display flex items-center gap-1.5 text-2xl leading-none font-extrabold tracking-tighter sm:text-4xl"
        onClick={handleLogoClick}
      >
        <Image
          priority
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
          className="size-7 group-hover:-translate-y-0.5 group-hover:-rotate-6 motion-safe:transition-transform sm:size-10"
        />
        Bypass Links
      </button>
      <div className="flex items-center gap-10">
        <nav
          className="hidden gap-8 text-sm font-semibold lg:flex"
          aria-label="Sections"
        >
          <a
            href="#features"
            className="py-3 transition-colors hover:text-primary"
          >
            Features
          </a>
          <a href="#faq" className="py-3 transition-colors hover:text-primary">
            FAQ
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
