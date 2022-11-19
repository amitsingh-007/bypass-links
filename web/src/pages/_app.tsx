import { CssBaseline, darkScrollbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@ui/styles/globals.scss';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { AuthProvider } from '@/ui/provider/AuthProvider';
import { Montserrat } from '@next/font/google';

const montserrat = Montserrat({ display: 'swap' });

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: montserrat.style.fontFamily,
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
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderWidth: '2px',
          borderRadius: '50px',
          ':hover': { borderWidth: '2px' },
        },
        root: {
          '&.Mui-disabled': {
            borderWidth: '2px',
          },
        },
      },
    },
  },
});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <StrictMode>
      <GlobalMetaTags />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DynamicProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </DynamicProvider>
      </ThemeProvider>
    </StrictMode>
  );
};

export default MyApp;
