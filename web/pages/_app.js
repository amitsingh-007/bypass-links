import { CssBaseline } from "@material-ui/core";
import darkScrollbar from "@material-ui/core/darkScrollbar";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import GlobalMetaTags from "@ui/components/GlobalMetaTags";
import { StrictMode } from "react";
import "../styles/globals.scss";

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

if (!__SERVER__ && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service worker registered");
      })
      .catch((err) => {
        console.log("Service worker registration failed", err);
      });
  });
}

const MyApp = ({ Component, pageProps }) => {
  return (
    <StrictMode>
      <GlobalMetaTags />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </StrictMode>
  );
};

export default MyApp;
