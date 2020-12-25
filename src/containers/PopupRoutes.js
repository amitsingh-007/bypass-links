import { IconButtonLoader } from "GlobalComponents/Loader";
import { ROUTES } from "GlobalConstants/routes";
import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import { Popup } from "./Popup";

const EditPanel = lazy(() => import("GlobalComponents/EditPanel"));

const PopupRoutes = () => {
  return (
    <Suspense fallback={<IconButtonLoader />}>
      <Switch>
        <Route exact path={ROUTES.HOMEPAGE}>
          <Popup />
        </Route>
        <Route exact path={ROUTES.EDIT_PANEL} render={() => <EditPanel />} />
      </Switch>
    </Suspense>
  );
};

export default PopupRoutes;
