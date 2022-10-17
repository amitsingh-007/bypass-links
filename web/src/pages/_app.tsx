import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@ui/styles/globals.scss';
import { AppProps } from 'next/dist/shared/lib/router/router';
import { StrictMode } from 'react';
import GlobalMetaTags from 'src/ui/components/GlobalMetaTags';

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
});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <StrictMode>
    <GlobalMetaTags />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  </StrictMode>
);

export default MyApp;
