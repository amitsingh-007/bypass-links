import identity from "ChromeApi/identity";
import { googleSignIn, googleSignOut } from "GlobalUtils/firebase";
import { processPostLogin, processPostLogout, processPreLogout } from "./sync";

const userSignIn = async () => {
  const googleAuthToken = await identity.getAuthToken({ interactive: true });
  const response = await googleSignIn(googleAuthToken);
  const userProfile = response.additionalUserInfo.profile;
  userProfile.googleAuthToken = googleAuthToken;
  userProfile.uid = response.user.uid;
  console.log("Firebase login response", response);
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
    await processPostLogout();
    return false;
  }
};

export const signOut = async () => {
  try {
    await processPreLogout();
    await googleSignOut();
    await processPostLogout();

    console.log("--------------Logout Success--------------");
    return true;
  } catch (err) {
    console.error("Error occured while signing out. ", err);
    return false;
  }
};
