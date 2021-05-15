import { ROUTES } from "GlobalConstants/routes";
import { Route } from "react-router-dom";
import PopupHome from "SrcPath/HomePopup/containers/PopupHome";

export const HomePageRoute = (
  <Route exact path={ROUTES.HOMEPAGE} render={() => <PopupHome />} />
);
