import { ROUTES } from '@bypass/shared';
import { Suspense } from 'react';
import { Route, Switch } from 'wouter';

import { POPUP_HOMEPAGE } from '@/constants';

import BookmarksPanel from '../panels/BookmarksPanel/components/BookmarksPanel';
import PopupHome from '../panels/HomePopup/containers/PopupHome';
import PersonsPanel from '../panels/PersonsPanel/components/PersonsPanel';
import ShortcutsPanel from '../panels/ShortcutsPanel/components/ShortcutsPanel';

function PopupRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path={POPUP_HOMEPAGE} component={PopupHome} />
        <Route path={ROUTES.SHORTCUTS_PANEL} component={ShortcutsPanel} />
        <Route path={ROUTES.BOOKMARK_PANEL} component={BookmarksPanel} />
        <Route path={ROUTES.PERSONS_PANEL} component={PersonsPanel} />
      </Switch>
    </Suspense>
  );
}

export default PopupRoutes;
