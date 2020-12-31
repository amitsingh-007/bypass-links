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
