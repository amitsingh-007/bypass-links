import { ROUTES } from '@bypass/common/constants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const PersonsPanel = lazy(() => import('../components/PersonsPanel'));

export const PersonsPanelRoute = (
  <Route path={ROUTES.PERSONS_PANEL} element={<PersonsPanel />} />
);
