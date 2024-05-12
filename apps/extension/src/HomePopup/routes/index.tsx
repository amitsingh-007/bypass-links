import { ROUTES } from '@bypass/shared';
import { Route } from 'wouter';
import PopupHome from '@/HomePopup/containers/PopupHome';

export const HomePageRoute = (
  <Route path={ROUTES.HOMEPAGE} component={PopupHome} />
);
