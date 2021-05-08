import { Box } from "@material-ui/core";
import { memo, useCallback, useEffect, useState } from "react";
import { getFaviconUrl } from "../utils";
import LanguageIcon from "@material-ui/icons/Language";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { getCacheObj, getFromCache } from "GlobalUtils/cache";

const containerStyles = {
  width: "20px",
  height: "20px",
  marginLeft: "6px",
  marginRight: "8px",
};

const Favicon = memo(({ url }) => {
  const [faviconUrl, setFaviconUrl] = useState("");

  const initFavicon = useCallback(async () => {
    const cache = await getCacheObj(CACHE_BUCKET_KEYS.favicon);
    const faviconBlob = await getFromCache(cache, getFaviconUrl(url));
    if (faviconBlob) {
      setFaviconUrl(URL.createObjectURL(faviconBlob));
    }
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
