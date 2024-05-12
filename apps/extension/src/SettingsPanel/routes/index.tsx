import { ROUTES } from '@bypass/shared';
import { Route } from 'wouter';
import SettingsPanel from '../components/SettingsPanel';

export const SettingsPanelRoute = (
  <Route path={ROUTES.SETTINGS_PANEL} component={SettingsPanel} />
);
