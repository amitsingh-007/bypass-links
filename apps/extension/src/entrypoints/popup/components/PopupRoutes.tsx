import { Suspense } from 'react';
import { Switch } from 'wouter';
import { BookmarksPanelRoute } from '../panels/BookmarksPanel/routes';
import { HomePageRoute } from '../panels/HomePopup/routes';
import { PersonsPanelRoute } from '../panels/PersonsPanel/routes';
import { ShortcutsPanelRoute } from '../panels/ShortcutsPanel/routes';

function PopupRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        {HomePageRoute}
        {ShortcutsPanelRoute}
        {BookmarksPanelRoute}
        {PersonsPanelRoute}
      </Switch>
    </Suspense>
  );
}

export default PopupRoutes;
