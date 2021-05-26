import { Box, IconButton, LinearProgress, Typography } from "@material-ui/core";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import {
  displayToast,
  resetAuthenticationProgress,
  setSignedInStatus,
} from "GlobalActionCreators";
import { IconButtonLoader } from "GlobalComponents/Loader";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "SrcPath/SettingsPanel/utils";
import { signIn, signOut } from "../utils/authentication";

const Authenticate = memo(() => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { isExtensionActive, authProgress } = useSelector((state) => state);

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
    const { message, progress, progressBuffer, total } = authProgress || {};
    return (
      <>
        <IconButtonLoader />
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%" }}>
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
        </Box>
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
