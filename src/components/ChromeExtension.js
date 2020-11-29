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
import { getExtensionFile } from "../utils";
import chromeLogo from "./chrome.svg";
import releaseConfig from "../../src/release-config.json";

const cardStyles = { backgroundColor: "#323638" };

export const ChromeExtension = () => {
  return (
    <Box width="360px" textAlign="left">
      <Card style={cardStyles}>
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
          <Typography color="textSecondary">
            4. Enjoy freely.
            <span role="img" aria-label="enjoy">
              😃
            </span>
          </Typography>
        </CardContent>
        <Box display="flex" justifyContent="center" pb="16px" pt="8px">
          <Fab
            variant="extended"
            href={`/bypass-links/${getExtensionFile(releaseConfig.version)}`}
          >
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
