import {
  useLocation,
  useNavigate,
  NavigateFunction,
  Location,
} from "react-router-dom";

const withRouter = (WrappedComponent: React.ComponentType<any>) =>
  function InnerComponent(props: any) {
    const location = useLocation();
    const navigate = useNavigate();
    return (
      <WrappedComponent {...props} navigate={navigate} location={location} />
    );
  };

export default withRouter;

export type WithRouterProps = {
  navigate: NavigateFunction;
  location: Location;
};
