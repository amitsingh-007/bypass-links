import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import DownloadPage from "./components/DownloadPage";
import { createMuiTheme, ThemeProvider, CssBaseline } from "@material-ui/core";

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
