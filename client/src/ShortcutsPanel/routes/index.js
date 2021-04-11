import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const ShortcutsPanel = lazy(() =>
  import(
    /*  webpackChunkName: "shortcuts-panel" */ "SrcPath/ShortcutsPanel/components/ShortcutsPanel"
  )
);

export const ShortcutsPanelRoute = (
  <Route
    exact
    path={ROUTES.SHORTCUTS_PANEL}
    render={() => <ShortcutsPanel />}
  />
);
