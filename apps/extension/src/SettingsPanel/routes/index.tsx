import { ROUTES } from '@bypass/shared';
import { Route } from 'react-router-dom';
import SettingsPanel from '../components/SettingsPanel';

export const SettingsPanelRoute = (
  <Route path={ROUTES.SETTINGS_PANEL} element={<SettingsPanel />} />
);
