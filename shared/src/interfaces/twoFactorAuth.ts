export type Setup2FAResponse = {
  secretKey: string;
  otpAuthUrl: string;
};

type VerifiedResponse = {
  isVerified: boolean;
};

export type Authenticate2FAResponse = VerifiedResponse;

export type Revoke2FAResponse = {
  isRevoked: boolean;
};

export type Status2FAResponse = {
  is2FAEnabled: boolean;
};

export type Verify2FAResponse = VerifiedResponse;
