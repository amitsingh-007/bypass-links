import { Suspense } from 'react';
import { Switch } from 'wouter';
import { BookmarksPanelRoute } from '@/BookmarksPanel/routes';
import { HomePageRoute } from '@/HomePopup/routes';
import { PersonsPanelRoute } from '@/PersonsPanel/routes';
import { SettingsPanelRoute } from '@/SettingsPanel/routes';
import { ShortcutsPanelRoute } from '@/ShortcutsPanel/routes';

function PopupRoutes() {
  return (
    <Suspense fallback={null}>
      <Switch>
        {HomePageRoute}
        {ShortcutsPanelRoute}
        {BookmarksPanelRoute}
        {PersonsPanelRoute}
        {SettingsPanelRoute}
      </Switch>
    </Suspense>
  );
}

export default PopupRoutes;
