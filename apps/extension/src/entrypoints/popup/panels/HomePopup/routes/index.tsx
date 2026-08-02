import { Route } from 'wouter';

import { POPUP_HOMEPAGE } from '@/constants';

import PopupHome from '../containers/PopupHome';

export const HomePageRoute = (
  <Route path={POPUP_HOMEPAGE} component={PopupHome} />
);
