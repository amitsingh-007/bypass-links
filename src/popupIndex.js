//https://stackoverflow.com/a/64135466/8694064
//https://next.material-ui.com/guides/migration-v4/#non-ref-forwarding-class-components
import {
  CssBaseline,
  StylesProvider,
  ThemeProvider,
  adaptV4Theme,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";
import Toast from "GlobalComponents/Toast";
import PopupRoutes from "GlobalContainers/PopupRoutes";
import "GlobalStyles/popup.scss";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore } from "redux";
import reducer from "./reducers";

const store = createStore(reducer);

const theme = createMuiTheme(
  adaptV4Theme({
    palette: {
      mode: "dark",
      background: {
        default: "#272c34",
      },
    },
    typography: {
      fontFamily: `"Inter", sans-serif`,
    },
  })
);

ReactDOM.render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <PopupRoutes />
              <Toast />
            </ThemeProvider>
          </StylesProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
