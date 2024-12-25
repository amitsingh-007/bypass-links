import { Avatar } from '@mantine/core';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { RiLinkUnlinkM } from 'react-icons/ri';
import { getFaviconProxyUrl } from '../../../utils';
import { getBlobUrlFromCache } from '../../../utils/cache';
import { ECacheBucketKeys } from '../../../constants/cache';

interface Props {
  url: string;
}

const Favicon = forwardRef<HTMLDivElement, Props>(
  ({ url, ...mantineTooltipProps }, ref) => {
    const [faviconUrl, setFaviconUrl] = useState('');

    const initFavicon = useCallback(async () => {
      const faviconBlobUrl = await getBlobUrlFromCache(
        ECacheBucketKeys.favicon,
        getFaviconProxyUrl(url)
      );
      setFaviconUrl(faviconBlobUrl);
    }, [url]);

    useEffect(() => {
      initFavicon();
    }, [initFavicon, url]);

    return (
      <Avatar
        ref={ref}
        radius="xs"
        size="1.25rem"
        src={faviconUrl}
        alt={faviconUrl}
        color="red"
        {...mantineTooltipProps}
      >
        <RiLinkUnlinkM size={14} />
      </Avatar>
    );
  }
);

export default Favicon;
