import { ROUTES } from '@bypass/shared';
import { Route } from 'react-router-dom';
import HistoryPanel from '../components/HistoryPanel';

export const HistoryPanelRoute = (
  <Route path={ROUTES.HISTORY_PANEL} element={<HistoryPanel />} />
);
