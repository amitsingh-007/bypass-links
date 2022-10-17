import { CssBaseline, darkScrollbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@ui/styles/globals.scss';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';
import { Provider as JotaiProvider } from 'jotai';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/ui/config/reactQuery';
import AuthProvider from '@/ui/components/AuthProvider';
import RouterProvider from '@/ui/provider/RouterProvider';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: `'Montserrat', sans-serif`,
    h2: {
      fontWeight: 400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: darkScrollbar(),
      },
    },
  },
});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <GlobalMetaTags />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider>
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            </RouterProvider>
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default MyApp;
