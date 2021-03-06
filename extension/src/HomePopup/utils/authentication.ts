import identity from "GlobalHelpers/chrome/identity";
import { googleSignIn, googleSignOut } from "GlobalHelpers/firebase";
import { AUTHENTICATION_EVENT } from "../constants/auth";
import { processPostLogin, processPostLogout, processPreLogout } from "./sync";
import { AuthenticationEvent } from "GlobalInterfaces/authentication";
import { UserInfo } from "../interfaces/authentication";

const userSignIn = async (): Promise<UserInfo> => {
  dispatchAuthenticationEvent({
    message: "Logging in user",
    progress: 0,
    progressBuffer: 1,
    total: 5,
  });
  const googleAuthToken = await identity.getAuthToken({ interactive: true });
  const response = await googleSignIn(googleAuthToken);
  const userProfile = response.additionalUserInfo?.profile ?? {};
  const userInfo: UserInfo = {
    ...userProfile,
    googleAuthToken,
    uid: response.user?.uid,
  };
  console.log("Firebase login response", response);
  console.log("UserInfo", userInfo);
  dispatchAuthenticationEvent({
    message: "User logged in",
    progress: 1,
    progressBuffer: 1,
    total: 5,
  });
  return userInfo;
};

export const signIn = async (): Promise<boolean> => {
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

export const signOut = async (): Promise<boolean> => {
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

export const dispatchAuthenticationEvent = (
  authProgressObj: AuthenticationEvent
) => {
  const event = new CustomEvent(AUTHENTICATION_EVENT, {
    detail: authProgressObj,
  });
  document.dispatchEvent(event);
};
