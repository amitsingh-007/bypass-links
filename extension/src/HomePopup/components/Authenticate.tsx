import {
  Dialog,
  IconButton,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import { setSignedInStatus } from "GlobalActionCreators";
import { resetAuthenticationProgress } from "GlobalActionCreators/auth";
import { displayToast } from "GlobalActionCreators/toast";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { COLOR } from "GlobalConstants/color";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "SrcPath/helpers/fetchFromStorage";
import { signIn, signOut } from "../utils/authentication";

const Authenticate = memo(() => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { authProgress } = useSelector((state: RootState) => state.auth);
  const { isExtensionActive } = useSelector(
    (state: RootState) => state.extension
  );

  const handleSignIn = async () => {
    setIsFetching(true);
    const isSignedIn = await signIn();
    setIsSignedIn(isSignedIn);
    dispatch(setSignedInStatus(isSignedIn));
    dispatch(resetAuthenticationProgress());
    setIsFetching(false);
  };

  const handleSignOut = useCallback(async () => {
    setIsFetching(true);
    const isSignedOut = await signOut();
    if (!isSignedOut) {
      dispatch(
        displayToast({
          message: "Error while logging out",
          severity: "error",
        })
      );
    } else {
      const isSignedIn = !isSignedOut;
      setIsSignedIn(isSignedIn);
      dispatch(setSignedInStatus(isSignedIn));
    }
    setIsFetching(false);
    dispatch(resetAuthenticationProgress());
  }, [dispatch]);

  const init = async () => {
    const userProfile = await getUserProfile();
    const isSignedIn = Boolean(userProfile);
    setIsSignedIn(isSignedIn);
    dispatch(setSignedInStatus(isSignedIn));
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  if (isFetching) {
    const {
      message,
      progress = 0,
      progressBuffer = 0,
      total = 1,
    } = authProgress || {};
    return (
      <>
        <IconButtonLoader />
        <Dialog
          sx={{
            ".MuiPaper-root": {
              m: 0,
              top: 0,
              width: "100%",
              position: "fixed",
              borderRadius: "0px",
              backgroundColor: "unset",
              backgroundImage: "unset",
            },
          }}
          open
        >
          <LinearProgress
            variant="buffer"
            value={(progress * 100) / total}
            valueBuffer={(progressBuffer * 100) / total}
            color="secondary"
          />
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",
              fontSize: "9px",
              fontStyle: "italic",
            }}
          >
            {message || "Loading"}
          </Typography>
        </Dialog>
      </>
    );
  }

  return isSignedIn ? (
    <IconButton
      aria-label="SignOut"
      component="span"
      style={COLOR.green}
      onClick={handleSignOut}
      title="Click to SignOut"
      disabled={!isExtensionActive}
    >
      <CloudDoneTwoToneIcon fontSize="large" />
    </IconButton>
  ) : (
    <IconButton
      aria-label="SignIn"
      component="span"
      style={getActiveDisabledColor(isExtensionActive, COLOR.red)}
      onClick={handleSignIn}
      title="Click to SignIn"
      disabled={!isExtensionActive}
    >
      <CloudOffTwoTone fontSize="large" />
    </IconButton>
  );
});

export default Authenticate;
