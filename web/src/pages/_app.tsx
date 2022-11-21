import { CssBaseline, darkScrollbar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@ui/styles/globals.scss';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';
import DynamicProvider from '@/ui/provider/DynamicProvider';
import { AuthProvider } from '@/ui/provider/AuthProvider';
import { Montserrat } from '@next/font/google';
import { BG_COLOR_BLACK } from '@common/constants/color';

const montserrat = Montserrat({ display: 'swap', subsets: ['latin'] });

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
    MuiDialogTitle: {
      styleOverrides: {
        root: { backgroundColor: BG_COLOR_BLACK },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { backgroundColor: BG_COLOR_BLACK },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { backgroundColor: BG_COLOR_BLACK },
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
