import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const ShortcutsPanel = lazy(
  () =>
    import(
      /*  webpackChunkName: "shortcuts-panel" */ "../components/ShortcutsPanel"
    )
);

export const ShortcutsPanelRoute = (
  <Route path={ROUTES.SHORTCUTS_PANEL} element={<ShortcutsPanel />} />
);
