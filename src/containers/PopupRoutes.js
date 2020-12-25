import { IconButtonLoader } from "GlobalComponents/Loader";
import React, { Suspense } from "react";
import { Switch } from "react-router-dom";
import {
  BookmarksPanelRoute,
  EditPanelRoute,
  HomePageRoute,
  ManualHistoryPanelRoute,
  QuickBookmarkPanelRoute,
} from "SrcPath/routes";

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      {HomePageRoute}
      {EditPanelRoute}
      {BookmarksPanelRoute}
      {ManualHistoryPanelRoute}
      {QuickBookmarkPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
