import { IconButtonLoader } from "GlobalComponents/Loader";
import { Suspense } from "react";
import { Switch } from "react-router-dom";
import { BookmarksPanelRoute } from "SrcPath/BookmarksPanel/routes/index";
import {
  EditPanelRoute,
  HomePageRoute,
  ManualHistoryPanelRoute,
} from "SrcPath/routes";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {EditPanelRoute}
      {BookmarksPanelRoute}
      {ManualHistoryPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
