import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Unlink02Icon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@bypass/ui';
import { getBlobUrlFromCache } from '../../../utils/cache';
import { ECacheBucketKeys } from '../../../constants/cache';

interface Props {
  url: string;
  ref?: React.Ref<HTMLDivElement>;
  getFaviconUrl: (url: string) => string;
}

const urlMap = new Map<string, string>();

const getBlobUrl = async (proxyUrl: string) => {
  const blobStr = urlMap.get(proxyUrl);
  if (blobStr) {
    return blobStr;
  }

  const blobUrl = await getBlobUrlFromCache(ECacheBucketKeys.favicon, proxyUrl);
  urlMap.set(proxyUrl, blobUrl);
  return blobUrl;
};

function Favicon({ url, ref, getFaviconUrl }: Props) {
  const [faviconUrl, setFaviconUrl] = useState('');

  useEffect(() => {
    const initFavicon = async () => {
      const proxyUrl = getFaviconUrl(url);
      setFaviconUrl(await getBlobUrl(proxyUrl));
    };
    initFavicon();
  }, [url, getFaviconUrl]);

  return (
    <Avatar ref={ref} size="sm" data-testid="bookmark-favicon">
      <AvatarImage src={faviconUrl} />
      <AvatarFallback>
        <HugeiconsIcon icon={Unlink02Icon} className="size-3.5" />
      </AvatarFallback>
    </Avatar>
  );
}

export default Favicon;
