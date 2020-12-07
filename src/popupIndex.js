import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { PopupContent } from "./containers/PopupContent";
import reducer from "./reducers";
import { createMuiTheme, ThemeProvider, CssBaseline } from "@material-ui/core";

const store = createStore(reducer);

const theme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: "#272c34",
    },
  },
});

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PopupContent />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
  document.getElementById("root")
);
