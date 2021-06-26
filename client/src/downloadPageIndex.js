import { CssBaseline } from "@material-ui/core";
import darkScrollbar from "@material-ui/core/darkScrollbar";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import DownloadPage from "SrcPath/DownloadPage/components/DownloadPage";
import "SrcPath/DownloadPage/styles/download-page.scss";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: darkScrollbar(),
    },
  },
  typography: {
    fontFamily: `"Montserrat", sans-serif`,
    h2: {
      fontWeight: "400",
    },
  },
});

ReactDOM.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DownloadPage />
    </ThemeProvider>
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
