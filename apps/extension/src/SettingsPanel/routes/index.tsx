import { ROUTES } from '@bypass/shared';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const SettingsPanel = lazy(() => import('../components/SettingsPanel'));

export const SettingsPanelRoute = (
  <Route path={ROUTES.SETTINGS_PANEL} element={<SettingsPanel />} />
);
