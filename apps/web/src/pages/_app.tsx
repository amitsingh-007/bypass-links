import { globalSEOConfig } from '@/ui/constants/globalSEO';
import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';

/**
 * Initialize dayjs with timezone plugin
 * timezone plugin requires utc plugin
 */
dayjs.extend(utc);
dayjs.extend(timezone);

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <StrictMode>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
        <DynamicProvider>
          <AuthProvider>
            <DefaultSeo {...globalSEOConfig} />
            <Component {...pageProps} />
          </AuthProvider>
        </DynamicProvider>
      </MantineProvider>
    </StrictMode>
  );
};

export default MyApp;
