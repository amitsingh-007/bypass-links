import { IconButtonLoader } from "GlobalComponents/Loader";
import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes/index";
import { HomePageRoute } from "SrcPath/HomePopup/routes/index";
import { HistoryPanelRoute } from "SrcPath/routes/index";
import { ShortcutsPanelRoute } from "SrcPath/ShortcutsPanel/routes/index";
import { TaggingPanelRoute } from "SrcPath/TaggingPanel/routes/index";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {TaggingPanelRoute}
      {HistoryPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
