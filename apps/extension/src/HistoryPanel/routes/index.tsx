import { ROUTES } from '@bypass/shared';
import { Route } from 'wouter';
import HistoryPanel from '../components/HistoryPanel';

export const HistoryPanelRoute = (
  <Route path={ROUTES.HISTORY_PANEL} component={HistoryPanel} />
);
