import { getBookmarksPanelUrl, ROUTES } from '@bypass/shared';
import { Progress, Spinner } from '@bypass/ui';
import {
  CollectionsBookmarkIcon,
  CommandIcon,
  UserAiIcon,
} from '@hugeicons/core-free-icons';

import useProgressStore from '@/store/progress';

import Authenticate from '../components/Authenticate';
import LastVisitedButton from '../components/LastVisitedButton';
import OpenDefaultsButton from '../components/OpenDefaultsButton';
import OpenForumLinks from '../components/OpenForumLinks';
import PanelNavButton from '../components/PanelNavButton';
import QuickBookmarkButton from '../components/QuickBookmarkButton';
import ToggleExtension from '../components/ToggleExtension';
import ToggleHistory from '../components/ToggleHistory';
import UserProfile from '../components/UserProfile';
import useExtensionOutdated from '../hooks/useExtensionOutdated';

const handleOpenAsPage = () => {
  browser.tabs.create({ url: window.location.href });
};

function PopupHome() {
  useExtensionOutdated();
  const { isLoading, progress } = useProgressStore();

  return (
    <div className="relative flex w-77.5 flex-col items-center px-4 pt-2 pb-4">
      {isLoading && (
        <>
          <div className="absolute inset-x-0 top-0 z-50">
            <Progress value={progress} />
          </div>
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80">
            <Spinner className="size-8" />
          </div>
        </>
      )}
      <div
        className="mb-4 cursor-pointer text-xl font-medium select-none"
        data-testid="home-popup-heading"
        onClick={handleOpenAsPage}
      >
        Bypass Links
      </div>
      <div className="mb-4 flex items-center justify-between gap-16">
        <div className="flex flex-col gap-2">
          <ToggleExtension />
          <ToggleHistory />
        </div>
        <UserProfile />
      </div>
      <div className="mt-4 grid w-full grid-cols-2 justify-between gap-3">
        <Authenticate />
        <OpenDefaultsButton />
        <PanelNavButton
          label="Shortcuts"
          icon={CommandIcon}
          route={ROUTES.SHORTCUTS_PANEL}
        />
        <QuickBookmarkButton />
        <PanelNavButton
          label="Persons"
          icon={UserAiIcon}
          route={ROUTES.PERSONS_PANEL}
        />
        <PanelNavButton
          label="Bookmarks"
          icon={CollectionsBookmarkIcon}
          route={getBookmarksPanelUrl({})}
        />
        <OpenForumLinks />
        <LastVisitedButton />
      </div>
    </div>
  );
}

export default PopupHome;
