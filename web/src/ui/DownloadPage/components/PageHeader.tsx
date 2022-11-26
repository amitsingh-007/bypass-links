import useDevice from '@/ui/hooks/useDevice';
import { Box, Typography } from '@mui/material';
import ChromeIcon from '@ui/icons/chrome.svg';
import { memo } from 'react';

const PageHeader = memo<{ downloadLink: string }>(({ downloadLink }) => {
  const isDesktop = useDevice();

  return (
    <Box
      sx={{
        m: isDesktop ? '150px 88px 0px' : '50px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <Typography
        component="h1"
        variant="h3"
        sx={{
          textAlign: 'center',
          fontSize: '40px',
          fontWeight: 'bold',
          lineHeight: '1.5',
        }}
      >
        Have a Link Bypasser and private Bookmarks Panel !
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Box
          data-test-attr="ext-download-button"
          component="a"
          href={downloadLink}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'linear-gradient(90deg,#6850ff,#a750ff)',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '17px',
            color: '#fff',
            padding: '14px 27px',
            mt: '50px',
            textDecoration: 'unset',
          }}
        >
          <ChromeIcon height={25} width={25} />
          <Box component="span" sx={{ ml: '10px' }}>
            DOWNLOAD NOW
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
PageHeader.displayName = 'PageHeader';

export default PageHeader;
