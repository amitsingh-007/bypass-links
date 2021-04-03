import { IconButtonLoader } from "GlobalComponents/Loader";
import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes/index";
import {
  EditPanelRoute,
  HomePageRoute,
  ManualHistoryPanelRoute,
} from "SrcPath/routes";
import { TaggingPanelRoute } from "SrcPath/TaggingPanel/routes/index";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {EditPanelRoute}
      {BookmarksPanelRoute}
      {TaggingPanelRoute}
      {ManualHistoryPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
