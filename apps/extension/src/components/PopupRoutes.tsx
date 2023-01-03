import { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import { BookmarksPanelRoute } from '@/BookmarksPanel/routes';
import { HistoryPanelRoute } from '@/HistoryPanel/routes';
import { HomePageRoute } from '@/HomePopup/routes';
import { PersonsPanelRoute } from '@/PersonsPanel/routes';
import { SettingsPanelRoute } from '@/SettingsPanel/routes';
import { ShortcutsPanelRoute } from '@/ShortcutsPanel/routes';

const PopupRoutes = () => (
  <Suspense fallback={null}>
    <Routes>
      {HomePageRoute}
      {ShortcutsPanelRoute}
      {BookmarksPanelRoute}
      {PersonsPanelRoute}
      {HistoryPanelRoute}
      {SettingsPanelRoute}
    </Routes>
  </Suspense>
);

export default PopupRoutes;
