import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { mantineTheme } from '@bypass/shared';
import { Global, MantineProvider } from '@mantine/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';

/**
 * Initialize dayjs with timezone plugin
 * timezone plugin requires utc plugin
 */
dayjs.extend(utc);
dayjs.extend(timezone);

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <StrictMode>
      <GlobalMetaTags />
      <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
        <DynamicProvider>
          <AuthProvider>
            <Component {...pageProps} />
            <Global styles={() => ({})} />
          </AuthProvider>
        </DynamicProvider>
      </MantineProvider>
    </StrictMode>
  );
};

export default MyApp;
