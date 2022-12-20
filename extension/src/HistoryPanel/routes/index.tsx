import { ROUTES } from '@bypass/shared/constants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const HistoryPanel = lazy(() => import('../components/HistoryPanel'));

export const HistoryPanelRoute = (
  <Route path={ROUTES.HISTORY_PANEL} element={<HistoryPanel />} />
);
