import { ROUTES } from '@bypass/shared';
import { Route } from 'react-router-dom';
import PopupHome from '@/HomePopup/containers/PopupHome';

export const HomePageRoute = (
  <Route path={ROUTES.HOMEPAGE} element={<PopupHome />} />
);
