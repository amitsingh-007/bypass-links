import { Avatar, AvatarFallback, AvatarImage } from '@bypass/ui';
import { Unlink02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { use, useEffect, useState } from 'react';

import { ECacheBucketKeys } from '../../../constants/cache';
import DynamicContext from '../../../provider/DynamicContext';
import { getBlobUrlFromCache } from '../../../utils/cache';

interface Props {
  url: string;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Bounded LRU. Object URLs are never garbage collected on their own, so an
 * uncapped map pinned one decoded blob per favicon ever rendered - unbounded in
 * the long-lived web bookmark panel. Evicted entries are revoked.
 */
const MAX_CACHED_FAVICONS = 200;
const urlMap = new Map<string, string>();

const getBlobUrl = async (proxyUrl: string) => {
  const cached = urlMap.get(proxyUrl);
  if (cached) {
    // Refresh recency
    urlMap.delete(proxyUrl);
    urlMap.set(proxyUrl, cached);
    return cached;
  }

  const blobUrl = await getBlobUrlFromCache(ECacheBucketKeys.favicon, proxyUrl);
  urlMap.set(proxyUrl, blobUrl);

  if (urlMap.size > MAX_CACHED_FAVICONS) {
    const [oldestKey, oldestUrl] = urlMap.entries().next().value!;
    urlMap.delete(oldestKey);
    if (oldestUrl) {
      URL.revokeObjectURL(oldestUrl);
    }
  }

  return blobUrl;
};

function Favicon({ url, ref }: Props) {
  const { favicon } = use(DynamicContext);
  const [faviconUrl, setFaviconUrl] = useState('');

  useEffect(() => {
    const initFavicon = async () => {
      setFaviconUrl(await getBlobUrl(favicon.getUrl(url)));
    };
    initFavicon();
  }, [url, favicon]);

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
