import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes";
import { HistoryPanelRoute } from "SrcPath/HistoryPanel/routes";
import { HomePageRoute } from "SrcPath/HomePopup/routes";
import { PersonsPanelRoute } from "SrcPath/PersonsPanel/routes";
import { SettingsPanelRoute } from "SrcPath/SettingsPanel/routes";
import { ShortcutsPanelRoute } from "SrcPath/ShortcutsPanel/routes";

const PopupRoutes = () => (
  <Suspense fallback={null}>
    <Switch>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {PersonsPanelRoute}
      {HistoryPanelRoute}
      {SettingsPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
