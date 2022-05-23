import { ROUTES } from 'GlobalConstants/routes';
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const PersonsPanel = lazy(
  () =>
    import(
      /*  webpackChunkName: "persons-panel" */ '../components/PersonsPanel'
    )
);

export const PersonsPanelRoute = (
  <Route path={ROUTES.PERSONS_PANEL} element={<PersonsPanel />} />
);
