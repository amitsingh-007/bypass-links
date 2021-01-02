import {
  createMuiTheme,
  CssBaseline,
  StylesProvider,
  ThemeProvider,
  adaptV4Theme,
} from "@material-ui/core";
import DownloadPage from "GlobalComponents/DownloadPage";
import "GlobalStyles/download-page.scss";
import "preact/devtools";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";

const theme = createMuiTheme(
  adaptV4Theme({
    typography: {
      fontFamily: `"Inter", sans-serif`,
      h2: {
        fontWeight: "400",
      },
    },
  })
);

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
      .register(`/${__PROD__ ? "bypass-links/" : ""}sw.js`)
      .then((res) => {
        console.log("Service worker registered", res);
      })
      .catch((err) => {
        console.log("Service worker registration failed", err);
      });
  });
}
