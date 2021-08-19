import { ROUTES } from "GlobalConstants/routes";
import { deserialzeQueryStringToObject } from "GlobalUtils/url";
import { lazy } from "react";
import { Route } from "react-router-dom";
import { BMPanelQueryParams } from "../interfaces/url";

const BookmarksPanel = lazy(
  () =>
    import(
      /* webpackChunkName: "bookmarks-panel" */ "../components/BookmarksPanel"
    )
);
const getQueryParams = (qs: string): BMPanelQueryParams => {
  const { folderContext, bmUrl, operation } = deserialzeQueryStringToObject(qs);
  return {
    folderContext,
    operation: Number(operation),
    bmUrl,
  };
};
export const BookmarksPanelRoute = (
  <Route
    exact
    path={ROUTES.BOOKMARK_PANEL}
    render={(props) => {
      const queryParams = getQueryParams(props.location.search);
      return <BookmarksPanel {...queryParams} {...props} />;
    }}
  />
);
