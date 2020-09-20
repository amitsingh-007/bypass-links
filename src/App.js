import { Box, Link, Typography } from "@material-ui/core";
import React from "react";
import "./App.css";
import { ChromeExtension } from "./components/ChromeExtension";

function App() {
  return (
    <Box textAlign="center" mt="20px" pl="150px" pr="150px">
      <Typography variant="h2" component="h2" gutterBottom>
        Welcome to Bypass Links
      </Typography>
      <Box mt="56px">
        <Typography variant="h5" component="h5" gutterBottom>
          Use Bypass Links browser extension to bypass timers, ads, captchas,
          etc on various websites to land directly on the target links.
        </Typography>
      </Box>
      <Typography variant="h5" component="h5" gutterBottom>
        {"Visit "}
        <Link
          href="https://github.com/amitsingh-007/bypass-links/#readme"
          target="_blank"
        >
          My Github Page
        </Link>
        {" to see all the currently supported websites to bypass."}
      </Typography>
      <Box display="flex" justifyContent="space-evenly" mt="56px">
        <ChromeExtension />
      </Box>
    </Box>
  );
}

export default App;
