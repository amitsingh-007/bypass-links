import { Progress, Spinner } from '@bypass/ui';
import Authenticate from '../components/Authenticate';
import BookmarksPanelButton from '../components/BookmarksPanelButton';
import LastVisitedButton from '../components/LastVisitedButton';
import OpenDefaultsButton from '../components/OpenDefaultsButton';
import OpenForumLinks from '../components/OpenForumLinks';
import PersonsPanelButton from '../components/PersonsPanelButton';
import QuickBookmarkButton from '../components/QuickBookmarkButton';
import ShortcutsPanelButton from '../components/ShortcutsPanelButton';
import ToggleExtension from '../components/ToggleExtension';
import ToggleHistory from '../components/ToggleHistory';
import UserProfile from '../components/UserProfile';
import useExtensionOutdated from '../hooks/useExtensionOutdated';
import useProgressStore from '@/store/progress';

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
          <div className="absolute top-0 right-0 left-0 z-50">
            <Progress value={progress} />
          </div>
          <div className="bg-background/80 absolute inset-0 z-40 flex items-center justify-center">
            <Spinner className="size-8 animate-spin" />
          </div>
        </>
      )}
      <div
        className="mb-4 cursor-pointer text-xl select-none"
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
      <div className="mt-4 grid w-full grid-cols-2 justify-between gap-x-3 gap-y-3">
        <Authenticate />
        <OpenDefaultsButton />
        <ShortcutsPanelButton />
        <QuickBookmarkButton />
        <PersonsPanelButton />
        <BookmarksPanelButton />
        <OpenForumLinks />
        <LastVisitedButton />
      </div>
    </div>
  );
}

export default PopupHome;
