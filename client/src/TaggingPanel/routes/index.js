import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const TaggingPanel = lazy(() =>
  import(
    /*  webpackChunkName: "tagging-panel" */ "SrcPath/TaggingPanel/components/TaggingPanel"
  )
);

export const TaggingPanelRoute = (
  <Route
    exact
    path={ROUTES.TAGGING_PANEL}
    render={(props) => <TaggingPanel {...props} />}
  />
);
