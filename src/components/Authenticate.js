import { IconButton } from "@material-ui/core";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSignedInStatus } from "../actionCreator";
import { COLOR } from "../constants/color";
import runtime from "../scripts/chrome/runtime";
import storage from "../scripts/chrome/storage";

export const Authenticate = memo(() => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    storage.get(["isSignedIn"]).then(({ isSignedIn }) => {
      setIsSignedIn(isSignedIn);
      dispatch(setSignedInStatus(isSignedIn));
    });
  }, [dispatch]);

  const handleSignIn = () => {
    runtime.sendMessage({ triggerSignIn: true }).then(({ isSignedIn }) => {
      setIsSignedIn(isSignedIn);
      dispatch(setSignedInStatus(isSignedIn));
    });
  };

  const handleSignOut = () => {
    runtime.sendMessage({ triggerSignOut: true }).then(({ isSignedOut }) => {
      const isSignedIn = !isSignedOut;
      setIsSignedIn(isSignedIn);
      dispatch(setSignedInStatus(isSignedIn));
    });
  };

  return isSignedIn ? (
    <IconButton
      aria-label="SignOut"
      component="span"
      style={COLOR.green}
      onClick={handleSignOut}
      title="Click to SignOut"
    >
      <CloudDoneTwoToneIcon fontSize="large" />
    </IconButton>
  ) : (
    <IconButton
      aria-label="SignIn"
      component="span"
      style={COLOR.red}
      onClick={handleSignIn}
      title="Click to SignIn"
    >
      <CloudOffTwoTone fontSize="large" />
    </IconButton>
  );
});
