import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { rtlCache } from '@/ui/utils/rtl-cache';
import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <StrictMode>
      <GlobalMetaTags />
      <div dir="rtl">
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ ...mantineTheme, dir: 'rtl' }}
          emotionCache={rtlCache}
        >
          <DynamicProvider>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          </DynamicProvider>
        </MantineProvider>
      </div>
    </StrictMode>
  );
};

export default MyApp;
