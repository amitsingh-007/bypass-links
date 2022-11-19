import { googleSignIn, googleSignOut } from '@/ui/firebase/auth';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ROUTES } from '@common/constants/routes';
import useWebPreload from '@/ui/hooks/useWebPreload';
import { useEffect, useState } from 'react';
import { useUser } from '@/ui/provider/AuthProvider';
import MetaTags from '@/ui/components/MetaTags';
import { RiLoginCircleFill, RiLogoutCircleRFill } from 'react-icons/ri';
import { RiBookMarkFill } from 'react-icons/ri';
import { FaUserTag } from 'react-icons/fa';
import { LoadingButton } from '@mui/lab';

export default function Web() {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const { isLoading, preloadData, clearData } = useWebPreload();
  const [shouldPreloadData, setShouldPreloadData] = useState(false);
  const [hasPreloaded, setHasPreloaded] = useState(false);

  useEffect(() => {
    if (shouldPreloadData && isLoggedIn && !hasPreloaded && !isLoading) {
      preloadData().then(() => {
        setHasPreloaded(true);
        setShouldPreloadData(false);
      });
    }
  }, [hasPreloaded, isLoading, preloadData, shouldPreloadData, isLoggedIn]);

  const handleSignIn = async () => {
    await googleSignIn();
    setShouldPreloadData(true);
  };

  const handleSignOut = async () => {
    await googleSignOut();
    await clearData();
    setShouldPreloadData(false);
    setHasPreloaded(false);
  };

  return (
    <Container maxWidth="md" sx={{ pt: '16px' }}>
      <MetaTags titleSuffix="Home" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          userSelect: 'none',
        }}
      >
        <Typography variant="h3">Bypass Links</Typography>
        <Typography variant="h4">Web Version</Typography>
        <LoadingButton
          variant="outlined"
          startIcon={
            isLoggedIn ? <RiLoginCircleFill /> : <RiLogoutCircleRFill />
          }
          onClick={isLoggedIn ? handleSignOut : handleSignIn}
          loading={isLoading}
          color={isLoggedIn ? 'success' : 'error'}
        >
          {isLoggedIn ? 'Logout' : 'Login'}
        </LoadingButton>
        <Button
          variant="outlined"
          startIcon={<RiBookMarkFill />}
          onClick={() => router.push(ROUTES.BOOKMARK_PANEL)}
          disabled={!isLoggedIn || isLoading}
          color="secondary"
        >
          Bookmarks Page
        </Button>
        <Button
          variant="outlined"
          startIcon={<FaUserTag />}
          onClick={() => router.push(ROUTES.PERSONS_PANEL)}
          disabled
          color="secondary"
        >
          Persons Page
        </Button>
      </Box>
    </Container>
  );
}
