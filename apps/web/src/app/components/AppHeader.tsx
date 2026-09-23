'use client';

import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useSyncExternalStore } from 'react';

import {
  BRAND,
  BRAND_MARK,
  CONTAINER,
  FOCUS_RING_ROUNDED,
} from '@app/constants/landing';
import { WEB_ROUTES } from '@app/constants/routes';

const NAV_LINK = `py-3 text-foreground transition-colors ease-landing hover:text-primary motion-reduce:transition-none ${FOCUS_RING_ROUNDED}`;

const subscribe = () => () => {};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isHydrated ? resolvedTheme === 'dark' : undefined}
      title="Toggle theme"
      className="ease-landing hover:bg-landing-soft max-landing-sm:ml-0 ml-3 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary motion-reduce:transition-none"
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
    <header
      className={`${CONTAINER} max-landing-sm:min-h-22.5 max-landing-sm:gap-3 flex min-h-29 items-center justify-between gap-6`}
    >
      <button
        type="button"
        className={`${BRAND} ${FOCUS_RING_ROUNDED} tracking-landing-brand text-(length:--text-landing-43)`}
        onClick={handleLogoClick}
      >
        <Image
          priority
          src="/bypass_link_192.png"
          alt=""
          height={64}
          width={64}
          className={BRAND_MARK}
        />
        <span>Bypass Links</span>
      </button>
      <div className="max-landing-sm:gap-2 flex items-center gap-2.5">
        <nav
          className="max-landing-md:hidden mr-5.5 flex items-center gap-7.5 text-(length:--text-landing-15) font-semibold"
          aria-label="Sections"
        >
          <a href="#features" className={NAV_LINK}>
            Features
          </a>
          <a href="#faq" className={NAV_LINK}>
            FAQ
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
