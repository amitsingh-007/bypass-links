import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import DownloadPage from "GlobalComponents/DownloadPage";
import "preact/devtools";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { isProd } from "./utils/index";

const theme = createMuiTheme({
  palette: {
    type: "dark",
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
      .register(`/${isProd() ? "bypass-links/" : ""}sw.js`)
      .then((res) => {
        console.log("service worker registered", res);
      })
      .catch((err) => {
        console.log("service worker not registered", err);
      });
  });
}
