import { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import { BookmarksPanelRoute } from 'SrcPath/BookmarksPanel/routes';
import { HistoryPanelRoute } from 'SrcPath/HistoryPanel/routes';
import { HomePageRoute } from 'SrcPath/HomePopup/routes';
import { PersonsPanelRoute } from 'SrcPath/PersonsPanel/routes';
import { SettingsPanelRoute } from 'SrcPath/SettingsPanel/routes';
import { ShortcutsPanelRoute } from 'SrcPath/ShortcutsPanel/routes';

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
