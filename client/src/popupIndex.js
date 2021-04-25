import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import darkScrollbar from "@material-ui/core/darkScrollbar";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";
import { BG_COLOR_BLACK } from "GlobalConstants/color";
import Global from "GlobalContainers/Global";
import PopupRoutes from "GlobalContainers/PopupRoutes";
import "GlobalStyles/popup.scss";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore } from "redux";
import reducer from "./reducers";

const store = createStore(reducer);

const theme = createMuiTheme({
  palette: {
    mode: "dark",
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
  },
});

ReactDOM.render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PopupRoutes />
            <Global />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
