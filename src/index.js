import "preact/devtools";
import React, { StrictMode } from "react";
import { render } from "react-dom";
import DownloadPage from "./components/DownloadPage";
import { createMuiTheme, ThemeProvider, CssBaseline } from "@material-ui/core";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <CssBaseline />
      <DownloadPage />
    </StrictMode>
  </ThemeProvider>,
  document.getElementById("root")
);
