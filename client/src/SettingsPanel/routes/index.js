import { ROUTES } from "GlobalConstants/routes";
import { lazy } from "react";
import { Route } from "react-router-dom";

const SettingsPanel = lazy(() =>
  import(
    /*  webpackChunkName: "settings-panel" */ "SrcPath/SettingsPanel/containers/SettingsPanel"
  )
);

export const SettingsPanelRoute = (
  <Route
    exact
    path={ROUTES.SETTINGS_PANEL}
    render={(props) => <SettingsPanel {...props} />}
  />
);
