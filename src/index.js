import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import DownloadPage from "GlobalComponents/DownloadPage";
import "preact/devtools";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";

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
