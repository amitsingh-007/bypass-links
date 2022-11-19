// Uncomment this to see render comments in the console
// if (!__PROD__) {
//   require("./scripts/wdyr");
// }
import { CssBaseline } from '@mui/material';
import darkScrollbar from '@mui/material/darkScrollbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ErrorBoundary from 'GlobalComponents/ErrorBoundary';
import { BG_COLOR_BLACK } from '@common/constants/color';
import Global from 'GlobalContainers/Global';
import PopupRoutes from 'GlobalContainers/PopupRoutes';
import 'GlobalStyles/popup.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import DynamicProvider from './provider/DynamicProvider';
import rootReducers from './reducers/rootReducer';

const middlewares = [];
if (!__PROD__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}
const store = compose(applyMiddleware(...middlewares))(createStore)(
  rootReducers
);

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
  },
});

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <DynamicProvider>
              <PopupRoutes />
            </DynamicProvider>
            <Global />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

document.body.addEventListener('keydown', (e) => {
  //prevent extension close on escape click
  if (e.key === 'Escape') {
    e.preventDefault();
  }
});
