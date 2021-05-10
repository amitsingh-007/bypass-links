import { IconButton } from "@material-ui/core";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import storage from "ChromeApi/storage";
import { displayToast, setSignedInStatus } from "GlobalActionCreators/index";
import { COLOR } from "GlobalConstants/color";
import { STORAGE_KEYS } from "GlobalConstants/index";
import { signIn, signOut } from "GlobalUtils/authentication";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButtonLoader } from "GlobalComponents/Loader";

const Authenticate = memo(() => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const isExtensionActive = useSelector((state) => state.isExtensionActive);

  const handleSignIn = async () => {
    setIsFetching(true);
    const isSignedIn = await signIn();
    setIsSignedIn(isSignedIn);
    dispatch(setSignedInStatus(isSignedIn));
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
  }, [dispatch]);

  useEffect(() => {
    storage.get([STORAGE_KEYS.userProfile]).then(({ userProfile }) => {
      const isSignedIn = Boolean(userProfile);
      setIsSignedIn(isSignedIn);
      dispatch(setSignedInStatus(isSignedIn));
    });
  }, []);

  useEffect(() => {
    if (isSignedIn && !isExtensionActive) {
      handleSignOut();
    }
  }, [handleSignOut, isExtensionActive, isSignedIn]);

  if (isFetching) {
    return <IconButtonLoader />;
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
