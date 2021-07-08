import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const HistoryPanel = lazy(
  () =>
    import(
      /*  webpackChunkName: "history-panel" */ "SrcPath/HistoryPanel/components/HistoryPanel"
    )
);

export const HistoryPanelRoute = (
  <Route exact path={ROUTES.HISTORY_PANEL} render={() => <HistoryPanel />} />
);
