import {
  Box,
  Card,
  CardContent,
  Fab,
  Link,
  Typography,
} from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import React from "react";
import chromeLogo from "./chrome.svg";

export const ChromeExtension = () => {
  return (
    <Box width="360px" textAlign="left">
      <Card>
        <CardContent>
          <Box textAlign="center">
            <Typography variant="h5" component="h2">
              <Box
                component="img"
                src={chromeLogo}
                alt="chrome-logo"
                width="20px"
              />{" "}
              Chrome
            </Typography>
          </Box>
          <Typography color="textSecondary">
            1. Download this extension.
          </Typography>
          <Typography color="textSecondary">
            2. Open{" "}
            <Link href="chrome://extensions/">chrome://extensions/</Link>
          </Typography>
          <Typography color="textSecondary">
            3. Drag and drop the extension to install.
          </Typography>
          <Typography color="textSecondary">4. Enjoy freely.😃</Typography>
        </CardContent>
        <Box display="flex" justifyContent="center" pb="16px" pt="8px">
          <Fab variant="extended" href="">
            <CloudDownloadIcon />
            <Box component="span" ml="8px">
              Download Bypass Links
            </Box>
          </Fab>
        </Box>
      </Card>
    </Box>
  );
};
