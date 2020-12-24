import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import { Popup } from "GlobalContainers/Popup";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "./reducers";
import "GlobalStyles/popup.scss";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";

const store = createStore(reducer);

const theme = createMuiTheme({
  palette: {
    type: "dark",
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Popup />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
