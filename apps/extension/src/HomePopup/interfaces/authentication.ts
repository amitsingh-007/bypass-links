export type UserInfo = {
  googleAuthToken?: string;
  uid?: string;
  name?: string;
  picture?: string;
  is2FAEnabled?: boolean;
  isTOTPVerified?: boolean;
};
