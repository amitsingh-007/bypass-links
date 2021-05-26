import { IconButtonLoader } from "GlobalComponents/Loader";
import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes";
import { HomePageRoute } from "SrcPath/HomePopup/routes";
import { HistoryPanelRoute } from "SrcPath/routes";
import { SettingsPanelRoute } from "SrcPath/SettingsPanel/routes";
import { ShortcutsPanelRoute } from "SrcPath/ShortcutsPanel/routes";
import { TaggingPanelRoute } from "SrcPath/TaggingPanel/routes";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {TaggingPanelRoute}
      {HistoryPanelRoute}
      {SettingsPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
