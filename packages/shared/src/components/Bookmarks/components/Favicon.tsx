import { Avatar } from '@mantine/core';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { RiLinkUnlinkM } from 'react-icons/ri';
import { CACHE_BUCKET_KEYS } from '../../../constants/cache';
import { getFaviconProxyUrl } from '../../../utils';
import { getBlobUrlFromCache } from '../../../utils/cache';

interface Props {
  url: string;
}

const Favicon = forwardRef<HTMLDivElement, Props>(function Favicon(
  { url, ...mantineTooltipProps },
  ref
) {
  const [faviconUrl, setFaviconUrl] = useState('');

  const initFavicon = useCallback(async () => {
    const faviconBlobUrl = await getBlobUrlFromCache(
      CACHE_BUCKET_KEYS.favicon,
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
      size={20}
      src={faviconUrl}
      alt={faviconUrl}
      color="red"
      {...mantineTooltipProps}
    >
      <RiLinkUnlinkM size={14} />
    </Avatar>
  );
});

export default Favicon;
