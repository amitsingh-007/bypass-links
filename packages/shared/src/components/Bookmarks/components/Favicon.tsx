import { Avatar, AvatarFallback, AvatarImage } from '@bypass/ui';
import { Unlink02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { use } from 'react';
import useSWR from 'swr';

import { ECacheBucketKeys } from '../../../constants/cache';
import DynamicContext from '../../../provider/DynamicContext';
import { swrKeys } from '../../../swr/keys';
import { getBlobUrlFromCache } from '../../../utils/cache';

interface Props {
  url: string;
  ref?: React.Ref<HTMLDivElement>;
}

function Favicon({ url, ref }: Props) {
  const { favicon } = use(DynamicContext);
  const { data: faviconUrl = '' } = useSWR(swrKeys.favicon(url), async () =>
    getBlobUrlFromCache(ECacheBucketKeys.favicon, favicon.getUrl(url))
  );

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
