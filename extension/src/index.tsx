import { CssBaseline } from '@mui/material';
import darkScrollbar from '@mui/material/darkScrollbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ErrorBoundary from '@components/ErrorBoundary';
import { BG_COLOR_BLACK } from '@bypass/shared/constants/color';
import '@/scss/popup.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import DynamicProvider from './provider/DynamicProvider';
import PopupRoutes from './components/PopupRoutes';
import Global from './components/Global';

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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DynamicProvider>
            <PopupRoutes />
          </DynamicProvider>
          <Global />
        </ThemeProvider>
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
