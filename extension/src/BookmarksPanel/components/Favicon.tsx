import { Box, SvgIcon } from "@material-ui/core";
import { SxProps } from "@material-ui/system";
import { CACHE_BUCKET_KEYS } from "GlobalConstants/cache";
import { getBlobUrlFromCache } from "GlobalUtils/cache";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";
import { MdBrokenImage } from "react-icons/md";
import { getFaviconUrl } from "../utils";

const containerStyles = {
  width: "20px",
  height: "20px",
  marginRight: "12px",
  display: "flex",
  flexDirection: "center",
} as SxProps;

const Favicon = memo(
  forwardRef<HTMLDivElement, { url: string }>(
    ({ url, ...tooltipProps }, ref) => {
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
        <Box
          component="img"
          src={faviconUrl}
          sx={containerStyles}
          ref={ref}
          {...tooltipProps}
        />
      ) : (
        <Box sx={containerStyles} ref={ref} {...tooltipProps}>
          <SvgIcon color="disabled">
            <MdBrokenImage />
          </SvgIcon>
        </Box>
      );
    }
  )
);
Favicon.displayName = "Favicon";

export default Favicon;
