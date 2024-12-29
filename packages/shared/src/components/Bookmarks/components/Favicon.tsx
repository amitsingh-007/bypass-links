import { Avatar } from '@mantine/core';
import { forwardRef, useEffect, useState } from 'react';
import { RiLinkUnlinkM } from 'react-icons/ri';
import { getFaviconProxyUrl } from '../../../utils';
import { getBlobUrlFromCache } from '../../../utils/cache';
import { ECacheBucketKeys } from '../../../constants/cache';

interface Props {
  url: string;
}

const urlMap = new Map<string, string>();

const getBlobUrl = async (url: string) => {
  const proxyUrl = getFaviconProxyUrl(url);

  const blobStr = urlMap.get(proxyUrl);
  if (blobStr) {
    return blobStr;
  }

  const blobUrl = await getBlobUrlFromCache(ECacheBucketKeys.favicon, proxyUrl);
  urlMap.set(proxyUrl, blobUrl);
  return blobUrl;
};

const Favicon = forwardRef<HTMLDivElement, Props>(
  ({ url, ...mantineTooltipProps }, ref) => {
    const [faviconUrl, setFaviconUrl] = useState('');

    useEffect(() => {
      const initFavicon = async () => {
        setFaviconUrl(await getBlobUrl(url));
      };
      initFavicon();
    }, [url]);

    return (
      <Avatar
        ref={ref}
        radius="xs"
        size={17}
        src={faviconUrl}
        color="red"
        {...mantineTooltipProps}
      >
        <RiLinkUnlinkM size={14} />
      </Avatar>
    );
  }
);

export default Favicon;
