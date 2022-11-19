import { ROUTES } from '@common/constants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const SettingsPanel = lazy(
  () =>
    import(
      /*  webpackChunkName: "settings-panel" */ '../containers/SettingsPanel'
    )
);

export const SettingsPanelRoute = (
  <Route path={ROUTES.SETTINGS_PANEL} element={<SettingsPanel />} />
);
