'use client';

import { ROUTES } from '@app/constants/routes';
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
        sticky inset-x-0 top-0 z-1001 h-[72px] max-h-[72px] border-b
        border-white/10 backdrop-blur-sm
      "
    >
      <div className="flex h-full items-center justify-center">
        <Image
          priority
          src="/bypass_link_192.png"
          alt="app-icon"
          height={70}
          width={70}
          onClick={() => setClickCount(clickCount + 1)}
        />
      </div>
    </header>
  );
}

export default AppHeader;
