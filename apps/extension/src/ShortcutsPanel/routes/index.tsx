import { ROUTES } from '@bypass/shared';
import { Route } from 'wouter';
import ShortcutsPanel from '../components/ShortcutsPanel';

export const ShortcutsPanelRoute = (
  <Route path={ROUTES.SHORTCUTS_PANEL} component={ShortcutsPanel} />
);
