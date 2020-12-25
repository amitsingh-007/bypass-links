import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";
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
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PopupRoutes />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
