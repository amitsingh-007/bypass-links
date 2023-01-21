import { ROUTES } from '@/ui/constants/routes';
import { Center, Header } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';

const AppHeader = memo(function AppHeader() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount === 5) {
      router.push(ROUTES.BYPASS_LINKS_WEB);
    }
  }, [clickCount, router]);

  return (
    <Header
      height={72}
      pos="sticky"
      sx={(theme) => ({
        backdropFilter: 'blur(10px)',
        backgroundColor: `${theme.colors.dark[7]}66`,
      })}
    >
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
    </Header>
  );
});

export default AppHeader;
