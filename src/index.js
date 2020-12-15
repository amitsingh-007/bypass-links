import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import DownloadPage from "GlobalComponents/DownloadPage";
import "preact/devtools";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import "GlobalStyles/download-page.scss";

const theme = createMuiTheme({
  typography: {
    fontFamily: `"Inter", sans-serif`,
    h2: {
      fontWeight: "400",
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <CssBaseline />
      <DownloadPage />
    </StrictMode>
  </ThemeProvider>,
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
