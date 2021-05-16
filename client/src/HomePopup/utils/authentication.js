import identity from "ChromeApi/identity";
import { googleSignIn, googleSignOut } from "GlobalUtils/firebase";
import { AUTHENTICATION_EVENT } from "../constants/auth";
import { processPostLogin, processPostLogout, processPreLogout } from "./sync";

const userSignIn = async () => {
  dispatchAuthenticationEvent({
    message: "Logging in user",
    progress: 0,
    progressBuffer: 1,
    total: 5,
  });
  const googleAuthToken = await identity.getAuthToken({ interactive: true });
  const response = await googleSignIn(googleAuthToken);
  const userProfile = response.additionalUserInfo.profile;
  userProfile.googleAuthToken = googleAuthToken;
  userProfile.uid = response.user.uid;
  console.log("Firebase login response", response);
  dispatchAuthenticationEvent({
    message: "User logged in",
    progress: 1,
    progressBuffer: 1,
    total: 5,
  });
  return userProfile;
};

export const signIn = async () => {
  try {
    const userProfile = await userSignIn();
    await processPostLogin(userProfile);
    console.log("--------------Login Success--------------");
    return true;
  } catch (err) {
    console.error("Error occured while signing in. ", err);
    console.log("Reverting due to login error...");
    await signOut();
    return false;
  }
};

export const signOut = async () => {
  try {
    await processPreLogout();
    dispatchAuthenticationEvent({
      message: "Logging out user",
      progress: 1,
      progressBuffer: 2,
      total: 4,
    });
    await googleSignOut();
    dispatchAuthenticationEvent({
      message: "User logged out",
      progress: 2,
      progressBuffer: 2,
      total: 4,
    });
    await processPostLogout();

    console.log("--------------Logout Success--------------");
    return true;
  } catch (err) {
    console.error("Error occured while signing out. ", err);
    return false;
  }
};

export const dispatchAuthenticationEvent = (authProgressObj) => {
  const event = new CustomEvent(AUTHENTICATION_EVENT, {
    detail: authProgressObj,
  });
  document.dispatchEvent(event);
};
