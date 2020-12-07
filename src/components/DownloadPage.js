import { Box, Link, Typography } from "@material-ui/core";
import React from "react";
import { ChromeExtension } from "./ChromeExtension";

const DownloadPage = () => (
  <>
    <Box textAlign="center" mt="20px" pl="150px" pr="150px">
      <Typography component="h1" variant="h2" gutterBottom>
        Welcome to Bypass Links
      </Typography>
      <Box mt="56px">
        <Typography component="div" variant="h5" gutterBottom>
          Use Bypass Links browser extension to bypass timers, ads, captchas,
          etc on various websites to land directly on the target links.
        </Typography>
      </Box>
      <Typography component="div" variant="h5" gutterBottom>
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
    <Box
      display="flex"
      justifyContent="space-between"
      width="100%"
      position="fixed"
      bottom="0"
      padding="12px"
    >
      <Typography>{`Latest Version: ${__EXT_VERSION__}`}</Typography>
      <Typography>{`Last Update: ${__RELEASE_DATE__}`}</Typography>
    </Box>
  </>
);

export default DownloadPage;
