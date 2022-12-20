import { ROUTES } from '@bypass/shared/constants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const ShortcutsPanel = lazy(() => import('../components/ShortcutsPanel'));

export const ShortcutsPanelRoute = (
  <Route path={ROUTES.SHORTCUTS_PANEL} element={<ShortcutsPanel />} />
);
