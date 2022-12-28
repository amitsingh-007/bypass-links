import '@/scss/popup.scss';
import { mantineTheme } from '@bypass/shared/constants/theme';
import ErrorBoundary from '@components/ErrorBoundary';
import { MantineProvider } from '@mantine/core';
import { CssBaseline } from '@mui/material';
import darkScrollbar from '@mui/material/darkScrollbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Global from './components/Global';
import PopupRoutes from './components/PopupRoutes';
import DynamicProvider from './provider/DynamicProvider';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: `"Inter", sans-serif`,
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
    MuiTextField: {
      defaultProps: {
        autoComplete: 'off',
      },
    },
  },
});

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <DynamicProvider>
              <>
                <PopupRoutes />
                <Global />
              </>
            </DynamicProvider>
          </ThemeProvider>
        </MantineProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);

document.body.addEventListener('keydown', (e) => {
  //prevent extension close on escape click
  if (e.key === 'Escape') {
    e.preventDefault();
  }
});
