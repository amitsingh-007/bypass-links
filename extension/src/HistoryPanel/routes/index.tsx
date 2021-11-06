import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const HistoryPanel = lazy(
  () =>
    import(
      /*  webpackChunkName: "history-panel" */ "../components/HistoryPanel"
    )
);

export const HistoryPanelRoute = (
  <Route path={ROUTES.HISTORY_PANEL} element={<HistoryPanel />} />
);
