// !NOTE: maintain below order of css
import '@mantine/core/styles.css';
import '@/styles/global.css';
import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { mantineTheme } from '@bypass/shared';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
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
      <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
        <DynamicProvider>
          <AuthProvider>
            <Component {...pageProps} />
            <Analytics />
          </AuthProvider>
        </DynamicProvider>
      </MantineProvider>
    </StrictMode>
  );
};

export default MyApp;
