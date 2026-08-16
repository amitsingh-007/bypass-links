import { DynamicContext } from '@bypass/shared';
import { LinkSquare02Icon } from '@hugeicons/core-free-icons';
import { use, useState } from 'react';

import { redirectionsItem } from '@/storage/items';

import HomeActionButton from './HomeActionButton';

function OpenDefaultsButton() {
  const { tabs } = use(DynamicContext);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenDefaults = async () => {
    setIsFetching(true);
    const redirections = await redirectionsItem.getValue();
    redirections
      .filter(({ isDefault, alias, website }) => isDefault && alias && website)
      .forEach(({ website }) => {
        tabs.open(atob(website));
      });
    setIsFetching(false);
  };

  return (
    <HomeActionButton
      label="Defaults"
      icon={LinkSquare02Icon}
      isBusy={isFetching}
      testId="open-defaults-button"
      onClick={handleOpenDefaults}
    />
  );
}

export default OpenDefaultsButton;
