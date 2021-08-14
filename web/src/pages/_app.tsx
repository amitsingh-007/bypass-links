import { CssBaseline } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import "@ui/styles/globals.scss";
import { AppProps } from "next/dist/shared/lib/router/router";
import { StrictMode } from "react";
import GlobalMetaTags from "src/ui/components/GlobalMetaTags";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: `"Montserrat", sans-serif`,
    h2: {
      fontWeight: 400,
    },
  },
});

if (!__SERVER__ && __PROD__ && "serviceWorker" in navigator) {
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

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <StrictMode>
    <GlobalMetaTags />
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  </StrictMode>
);

export default MyApp;
