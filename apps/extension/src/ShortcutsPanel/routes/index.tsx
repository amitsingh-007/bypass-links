import { ROUTES } from '@bypass/shared';
import { Route } from 'react-router-dom';
import ShortcutsPanel from '../components/ShortcutsPanel';

export const ShortcutsPanelRoute = (
  <Route path={ROUTES.SHORTCUTS_PANEL} element={<ShortcutsPanel />} />
);
