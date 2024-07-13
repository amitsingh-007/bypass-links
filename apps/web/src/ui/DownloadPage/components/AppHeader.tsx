'use client';

import { ROUTES } from '@/ui/constants/routes';
import { Box, Center } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import styles from './styles/AppHeader.module.css';

const AppHeader = memo(function AppHeader() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount === 5) {
      router.push(ROUTES.BYPASS_LINKS_WEB);
    }
  }, [clickCount, router]);

  return (
    <Box className={styles.header}>
      <Center>
        <Image
          src="/bypass_link_192.png"
          alt="app-icon"
          height={70}
          width={70}
          priority
          onClick={() => setClickCount(clickCount + 1)}
        />
      </Center>
    </Box>
  );
});

export default AppHeader;
