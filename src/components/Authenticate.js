import { IconButton } from "@material-ui/core";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import React, { useEffect, useState } from "react";
import runtime from "../scripts/chrome/runtime";
import storage from "../scripts/chrome/storage";
import { useDispatch } from "react-redux";
import { setSignedInStatus } from "../actionCreator";

export const Authenticate = () => {
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
      style={{ color: green[500] }}
      onClick={handleSignOut}
      title="Click to SignOut"
    >
      <CloudDoneTwoToneIcon fontSize="large" />
    </IconButton>
  ) : (
    <IconButton
      aria-label="SignIn"
      component="span"
      style={{ color: red[500] }}
      onClick={handleSignIn}
      title="Click to SignIn"
    >
      <CloudOffTwoTone fontSize="large" />
    </IconButton>
  );
};
