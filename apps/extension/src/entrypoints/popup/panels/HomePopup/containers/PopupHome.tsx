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

const handleOpenAsPage = () => {
  browser.tabs.create({ url: window.location.href });
};

function PopupHome() {
  useExtensionOutdated();

  return (
    <div className="flex w-[310px] flex-col items-center px-4 pt-2 pb-4">
      <div
        className="text-primary mb-2.5 cursor-pointer text-xl font-bold select-none"
        data-testid="home-popup-heading"
        onClick={handleOpenAsPage}
      >
        Bypass Links
      </div>
      <div className="mb-4 flex items-center justify-between gap-10">
        <div className="flex flex-col gap-2">
          <ToggleExtension />
          <ToggleHistory />
        </div>
        <UserProfile />
      </div>
      <div className="mt-4 flex w-full flex-wrap justify-between gap-4 gap-y-2 [&>*]:w-[46.5%]">
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
