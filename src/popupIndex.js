import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import { Popup } from "GlobalContainers/Popup";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
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
    fontFamily: `"Inter"`,
  },
});

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Popup />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
  document.getElementById("root")
);
