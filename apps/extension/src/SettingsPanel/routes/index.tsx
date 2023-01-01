import { ROUTES } from '@bypass/shared/constants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const SettingsPanel = lazy(() => import('../components/SettingsPanel'));

export const SettingsPanelRoute = (
  <Route path={ROUTES.SETTINGS_PANEL} element={<SettingsPanel />} />
);
