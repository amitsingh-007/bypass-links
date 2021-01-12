import {
  Box,
  Card,
  CardContent,
  Fab,
  Link,
  Typography,
} from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import chromeLogo from "GlobalIcons/chrome.svg";
import { getExtensionFile } from "GlobalUtils/index";
import { memo } from "react";

export const ChromeExtension = memo(() => {
  const handleExtensionDownload = () => {
    fetch(
      `${__PROD__ ? "/bypass-links" : ""}/${getExtensionFile(__EXT_VERSION__)}`
    )
      .then((transfer) => transfer.blob())
      .then((bytes) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(bytes);
        downloadLink.setAttribute(
          "download",
          getExtensionFile(__EXT_VERSION__)
        );
        downloadLink.click();
        document.removeChild(downloadLink);
      });
  };

  return (
    <Box sx={{ width: "360px", textAlign: "left" }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" component="h2">
              <Box
                component="img"
                src={chromeLogo}
                alt="chrome-logo"
                sx={{ width: "20px" }}
              />
              {" Chrome"}
            </Typography>
          </Box>
          <Typography color="textPrimary">
            {"1. Download this extension."}
          </Typography>
          <Typography color="textPrimary">
            {"2. Open "}
            <Link href="chrome://extensions/">chrome://extensions/</Link>
          </Typography>
          <Typography color="textPrimary">
            {" 3. Drag and drop the extension to install."}
          </Typography>
          <Typography color="textPrimary">
            {"4. Enjoy freely."}
            <span role="img" aria-label="enjoy">
              😃
            </span>
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pb: "16px",
            pt: "8px",
          }}
        >
          <Fab variant="extended" onClick={handleExtensionDownload}>
            <CloudDownloadIcon />
            <Box component="span" sx={{ ml: "8px" }}>
              Download Bypass Links
            </Box>
          </Fab>
        </Box>
      </Card>
    </Box>
  );
});
