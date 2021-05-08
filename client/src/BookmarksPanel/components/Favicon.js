import { Box } from "@material-ui/core";
import LanguageIcon from "@material-ui/icons/Language";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { getBlobUrlFromCache } from "GlobalUtils/cache";
import { memo, useCallback, useEffect, useState } from "react";
import { getFaviconUrl } from "../utils";

const containerStyles = {
  width: "20px",
  height: "20px",
  marginLeft: "6px",
  marginRight: "8px",
};

const Favicon = memo(({ url }) => {
  const [faviconUrl, setFaviconUrl] = useState("");

  const initFavicon = useCallback(async () => {
    const faviconBlobUrl = await getBlobUrlFromCache(
      CACHE_BUCKET_KEYS.favicon,
      getFaviconUrl(url)
    );
    setFaviconUrl(faviconBlobUrl);
  }, [url]);

  useEffect(() => {
    initFavicon();
  }, [initFavicon, url]);

  return faviconUrl ? (
    <Box component="img" src={faviconUrl} sx={containerStyles} />
  ) : (
    <Box sx={containerStyles}>
      <LanguageIcon fontSize="small" color="disabled" />
    </Box>
  );
});

export default Favicon;
