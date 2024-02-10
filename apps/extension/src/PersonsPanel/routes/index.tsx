import { ROUTES } from '@bypass/shared';
import { Route } from 'react-router-dom';
import PersonsPanel from '../components/PersonsPanel';

export const PersonsPanelRoute = (
  <Route path={ROUTES.PERSONS_PANEL} element={<PersonsPanel />} />
);
