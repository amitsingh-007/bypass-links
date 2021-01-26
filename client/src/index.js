import {
  createMuiTheme,
  CssBaseline,
  StylesProvider,
  ThemeProvider,
} from "@material-ui/core";
import DownloadPage from "GlobalComponents/DownloadPage";
import "GlobalStyles/download-page.scss";
import { getRootPath } from "GlobalUtils/downloadPage";
import "preact/devtools";
import { StrictMode } from "react";
import ReactDOM from "react-dom";

const theme = createMuiTheme({
  typography: {
    fontFamily: `"Inter", sans-serif`,
    h2: {
      fontWeight: "400",
    },
  },
});

ReactDOM.render(
  <StrictMode>
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DownloadPage />
      </ThemeProvider>
    </StylesProvider>
  </StrictMode>,
  document.getElementById("root")
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((res) => {
        console.log("Service worker registered");
      })
      .catch((err) => {
        console.log("Service worker registration failed", err);
      });
  });
}
