import { BookmarksPanelRoute } from '@/BookmarksPanel/routes';
import { HistoryPanelRoute } from '@/HistoryPanel/routes';
import { HomePageRoute } from '@/HomePopup/routes';
import { PersonsPanelRoute } from '@/PersonsPanel/routes';
import { SettingsPanelRoute } from '@/SettingsPanel/routes';
import { ShortcutsPanelRoute } from '@/ShortcutsPanel/routes';
import { Suspense } from 'react';
import { Switch } from 'wouter';

const PopupRoutes = () => (
  <Suspense fallback={null}>
    <Switch>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {PersonsPanelRoute}
      {HistoryPanelRoute}
      {SettingsPanelRoute}
    </Switch>
  </Suspense>
);

export default PopupRoutes;
