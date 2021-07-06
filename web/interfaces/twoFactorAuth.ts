export interface User2FAInfo {
  secretKey: string;
  otpAuthUrl: string;
  is2FAEnabled: boolean;
}

export interface Setup2FAResponse {
  secretKey: string;
  otpAuthUrl: string;
}
