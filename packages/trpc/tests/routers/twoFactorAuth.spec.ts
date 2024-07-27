import { authenticator } from 'otplib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FirebaseUser, anonymousSignIn, deleteFirebaseUser } from '../firebase';
import { getTrpcCaller } from '../test-helpers';

const getRandomTotp = () => Math.floor(Math.random() * 1_000_000).toString();

describe('Two Factor Auth Setup Flow', () => {
  let user: FirebaseUser;
  let secretKey: string | undefined;
  let otpAuthUrl: string | undefined;
  let qrcode: string | undefined;

  beforeAll(async () => {
    const userCredential = await anonymousSignIn();
    user = userCredential.user;
  });

  afterAll(async () => {
    await deleteFirebaseUser(user);
  });

  it('should have expected response', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.status();
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });

  it('should create new totp for the first time', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.setup();
    expect(output).toHaveProperty('secretKey');
    expect(output).toHaveProperty('otpAuthUrl');
    expect(output).toHaveProperty('qrcode');
    expect(output.otpAuthUrl.startsWith('otpauth://totp/')).toBeTruthy();
    expect(output.qrcode.startsWith('data:image/png;base64')).toBeTruthy();

    secretKey = output.secretKey;
    otpAuthUrl = output.otpAuthUrl;
    qrcode = output.qrcode;
  });

  it('should return already created totp if requested to setup again', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.setup();
    expect(output).toStrictEqual({ secretKey, otpAuthUrl, qrcode });
  });

  it('should still show totp not setup after setup step', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.status();
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });

  it('should not verify if user enters wrong totp token', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.verify(getRandomTotp());
    expect(output).toStrictEqual({ isVerified: false });
  });

  it('should verify if user enters correct totp token', async () => {
    const caller = getTrpcCaller();
    const correctToken = authenticator.generate(secretKey ?? '');
    const output = await caller.twoFactorAuth.verify(correctToken);
    expect(output).toStrictEqual({ isVerified: true });
  });

  it('should show totp as setup after successfully verifying', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.status();
    expect(output).toStrictEqual({ is2FAEnabled: true });
  });

  it('should not authenticate the user if wrong totp token is entered', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.authenticate(getRandomTotp());
    expect(output).toStrictEqual({ isVerified: false });
  });

  it('should authenticate the user if correct totp token is entered', async () => {
    const caller = getTrpcCaller();
    const token = authenticator.generate(secretKey ?? '');
    const output = await caller.twoFactorAuth.authenticate(token);
    expect(output).toStrictEqual({ isVerified: true });
  });

  it('should revoke the totp status', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.revoke();
    expect(output).toStrictEqual({ isRevoked: true });
  });

  it('should show totp not setup after being revoked', async () => {
    const caller = getTrpcCaller();
    const output = await caller.twoFactorAuth.status();
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });
});
