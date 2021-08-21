// Uncomment this to see render comments in the console
if (!__PROD__) {
  require("../scripts/wdyr");
}
import { CssBaseline } from "@material-ui/core";
import darkScrollbar from "@material-ui/core/darkScrollbar";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import ErrorBoundary from "GlobalComponents/ErrorBoundary";
import { BG_COLOR_BLACK } from "GlobalConstants/color";
import Global from "GlobalContainers/Global";
import PopupRoutes from "GlobalContainers/PopupRoutes";
import "GlobalStyles/popup.scss";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, compose, createStore } from "redux";
import rootReducers from "./reducers/rootReducer";

const middlewares = [];
if (!__PROD__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { logger } = require("redux-logger");
  middlewares.push(logger);
}
const store = compose(applyMiddleware(...middlewares))(createStore)(
  rootReducers
);

const theme = createTheme({
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
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderWidth: "2px",
          borderRadius: "50px",
          ":hover": { borderWidth: "2px" },
        },
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

document.body.addEventListener("keydown", (e) => {
  //prevent extension close on escape click
  if (e.key === "Escape") {
    e.preventDefault();
  }
});
