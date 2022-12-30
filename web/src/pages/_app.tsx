import { AuthProvider } from '@/ui/provider/AuthProvider';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { mantineTheme } from '@bypass/shared/constants/theme';
import { Global, MantineProvider } from '@mantine/core';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';

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
