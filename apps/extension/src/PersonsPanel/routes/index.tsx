import { ROUTES } from '@bypass/shared';
import { Route } from 'wouter';
import PersonsPanel from '../components/PersonsPanel';

export const PersonsPanelRoute = (
  <Route path={ROUTES.PERSONS_PANEL} component={PersonsPanel} />
);
