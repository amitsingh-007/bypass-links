import firebase from "firebase/app";

// export interface UserInfo extends  {}

export type UserInfo = firebase.auth.AdditionalUserInfo["profile"] & {
  googleAuthToken?: string;
  uid?: firebase.UserInfo["uid"];
  is2FAEnabled?: boolean;
  isTOTPVerified?: boolean;
  name?: string;
  picture?: string;
};
