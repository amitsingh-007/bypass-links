import {
  createMuiTheme,
  CssBaseline,
  //Need styles provider until we remove makeStyles,etc
  //Refer: https://next.material-ui.com/guides/migration-v4/#styled-engine
  StylesProvider,
  ThemeProvider,
} from "@material-ui/core";
import darkScrollbar from "@material-ui/core/darkScrollbar";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";
import { BG_COLOR_DARK } from "GlobalConstants/color";
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
    background: {
      default: BG_COLOR_DARK,
    },
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
              <Global />
            </ThemeProvider>
          </StylesProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
  document.getElementById("root")
);
