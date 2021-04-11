import { IconButtonLoader } from "GlobalComponents/Loader";
import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes/index";
import { HomePageRoute, ManualHistoryPanelRoute } from "SrcPath/routes";
import { ShortcutsPanelRoute } from "SrcPath/ShortcutsPanel/routes/index";
import { TaggingPanelRoute } from "SrcPath/TaggingPanel/routes/index";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {TaggingPanelRoute}
      {ManualHistoryPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
