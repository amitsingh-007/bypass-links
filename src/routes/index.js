import { ROUTES } from "GlobalConstants/routes";
import { Popup } from "GlobalContainers/Popup";
import React, { lazy } from "react";
import { Route } from "react-router-dom";

export const HomePageRoute = (
  <Route exact path={ROUTES.HOMEPAGE} render={() => <Popup />} />
);

const EditPanel = lazy(() =>
  import(/*  webpackChunkName: "edit-panel" */ "GlobalComponents/EditPanel")
);
export const EditPanelRoute = (
  <Route exact path={ROUTES.EDIT_PANEL} render={() => <EditPanel />} />
);

const BookmarksPanel = lazy(() =>
  import(
    /*  webpackChunkName: "bookmarks-panel" */ "GlobalComponents/BookmarksPanel"
  )
);
export const BookmarksPanelRoute = (
  <Route exact path={ROUTES.BOOKMARK_PANEL} render={() => <BookmarksPanel />} />
);

const ManualHistoryPanel = lazy(() =>
  import(
    /*  webpackChunkName: "manual-history-panel" */ "GlobalComponents/ManualHistoryPanel"
  )
);
export const ManualHistoryPanelRoute = (
  <Route
    exact
    path={ROUTES.MANUAL_HISTORY_PANEL}
    render={() => <ManualHistoryPanel />}
  />
);

const QuickBookmarkPanel = lazy(() =>
  import(
    /*  webpackChunkName: "quick-bookmarks-panel" */ "GlobalComponents/QuickBookmarkPanel"
  )
);
const getQueryParams = (qs) => {
  const qsObj = new URLSearchParams(qs);
  return {
    url: qsObj.get("url"),
    title: qsObj.get("title"),
    isBookmarked: qsObj.get("isBookmarked"),
  };
};
export const QuickBookmarkPanelRoute = (
  <Route
    exact
    path={ROUTES.QUICK_BOOKMARK_PANEL}
    render={(props) => {
      const queryParams = getQueryParams(props.location.search);
      return <QuickBookmarkPanel {...queryParams} />;
    }}
  />
);
