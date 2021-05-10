import { ROUTES } from "GlobalConstants/routes";
import { Route } from "react-router-dom";
import Popup from "SrcPath/HomePopup/containers/Popup";

export const HomePageRoute = (
  <Route exact path={ROUTES.HOMEPAGE} render={() => <Popup />} />
);
