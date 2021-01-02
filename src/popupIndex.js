import {
  CssBaseline,
  //Need styles provider until we remove makeStyles,etc
  //Refer: https://next.material-ui.com/guides/migration-v4/#styled-engine
  StylesProvider,
  ThemeProvider,
  createMuiTheme,
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

const theme = createMuiTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#272c34",
    },
  },
  typography: {
    fontFamily: `"Inter", sans-serif`,
  },
});

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
