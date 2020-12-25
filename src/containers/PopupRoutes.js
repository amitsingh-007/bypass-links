import { IconButtonLoader } from "GlobalComponents/Loader";
import { ROUTES } from "GlobalConstants/routes";
import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import { Popup } from "./Popup";

const EditPanel = lazy(() => import("GlobalComponents/EditPanel"));
const BookmarksPanel = lazy(() => import("GlobalComponents/BookmarksPanel"));
const ManualHistoryPanel = lazy(() =>
  import("GlobalComponents/ManualHistoryPanel")
);
const QuickBookmarkPanel = lazy(() =>
  import("GlobalComponents/QuickBookmarkPanel")
);

const PopupRoutes = () => (
  <Suspense fallback={<IconButtonLoader />}>
    <Switch>
      <Route exact path={ROUTES.HOMEPAGE} render={() => <Popup />} />
      <Route exact path={ROUTES.EDIT_PANEL} render={() => <EditPanel />} />
      <Route
        exact
        path={ROUTES.MANUAL_HISTORY_PANEL}
        render={() => <ManualHistoryPanel />}
      />
      <Route
        exact
        path={ROUTES.BOOKMARK_PANEL}
        render={() => <BookmarksPanel />}
      />
      <Route
        exact
        path={ROUTES.QUICK_BOOKMARK_PANEL}
        render={() => <QuickBookmarkPanel />}
      />
    </Switch>
  </Suspense>
);

export default PopupRoutes;
