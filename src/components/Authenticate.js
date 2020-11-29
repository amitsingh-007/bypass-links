import { IconButton } from "@material-ui/core";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import CloudDoneTwoToneIcon from "@material-ui/icons/CloudDoneTwoTone";
import CloudOffTwoTone from "@material-ui/icons/CloudOffTwoTone";
import React, { useEffect, useState } from "react";
import runtime from "../scripts/chrome/runtime";
import storage from "../scripts/chrome/storage";

export const Authenticate = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    storage.get(["isSignedIn"]).then(({ isSignedIn }) => {
      setIsSignedIn(isSignedIn);
    });
  }, []);

  const handleSignIn = () => {
    runtime.sendMessage({ triggerSignIn: true }).then(({ isSignedIn }) => {
      setIsSignedIn(isSignedIn);
    });
  };

  const handleSignOut = () => {
    runtime.sendMessage({ triggerSignOut: true }).then(({ isSignedOut }) => {
      setIsSignedIn(!isSignedOut);
    });
  };

  return isSignedIn ? (
    <IconButton
      aria-label="SignOut"
      component="span"
      style={{ color: green[500] }}
      onClick={handleSignOut}
    >
      <CloudDoneTwoToneIcon fontSize="large" />
    </IconButton>
  ) : (
    <IconButton
      aria-label="SignIn"
      component="span"
      style={{ color: red[500] }}
      onClick={handleSignIn}
    >
      <CloudOffTwoTone fontSize="large" />
    </IconButton>
  );
};
