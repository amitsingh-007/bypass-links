'use client';

import { ROUTES } from '@app/constants/routes';
import { GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function AppHeader() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount === 5) {
      router.push(ROUTES.BYPASS_LINKS_WEB);
    }
  }, [clickCount, router]);

  return (
    <header
      className="
        sticky top-0 z-50 border-b-2 border-primary/20 bg-linear-to-r
        from-primary/5 via-background to-primary/5
      "
    >
      <div
        className="
          mx-auto flex h-16 max-w-7xl items-center justify-between px-6
        "
      >
        <button
          type="button"
          className="group flex items-center gap-3"
          onClick={() => setClickCount(clickCount + 1)}
        >
          <div
            className="
              rounded-lg bg-primary/10 p-1.5 transition-colors
              group-hover:bg-primary/20
            "
          >
            <Image
              priority
              src="/bypass_link_192.png"
              alt="Bypass Links"
              height={24}
              width={24}
            />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base font-bold tracking-tight">
              Bypass Links
            </span>
            <span
              className="
                text-[10px] font-medium tracking-widest text-muted-foreground
                uppercase
              "
            >
              Skip the wait
            </span>
          </div>
        </button>
        <a
          href="https://github.com/bypass-links/bypass-links"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex size-8 items-center justify-center rounded-lg border
            border-border bg-background text-muted-foreground transition-all
            hover:border-primary/30 hover:text-foreground
          "
        >
          <HugeiconsIcon icon={GithubIcon} size={16} />
        </a>
      </div>
    </header>
  );
}

export default AppHeader;
