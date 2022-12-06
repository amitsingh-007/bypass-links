import { AppBar, Box, Toolbar } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ROUTES } from '@/ui/constants/routes';

const AppHeader = memo(() => {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount == 5) {
      router.push(ROUTES.BYPASS_LINKS_WEB);
    }
  }, [clickCount, router]);

  return (
    <AppBar
      position="static"
      sx={{
        background: '#202225',
        borderBottom: '1px solid #202225',
        boxShadow: '0 0 5px rgb(0 0 0 / 35%)',
        borderColor: '#080808',
        borderWidth: '0 0 1px',
      }}
    >
      <Toolbar sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '80%',
            left: '50%',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#202225',
                borderRadius: '50%',
                padding: '8px',
              }}
              onClick={() => setClickCount(clickCount + 1)}
            >
              <Image
                src="/bypass_link_192.png"
                alt="app-icon"
                height={75}
                width={75}
                priority
              />
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
});
AppHeader.displayName = 'AppHeader';

export default AppHeader;
