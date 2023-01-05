import { describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';
import { authenticator } from 'otplib';

const uid = !global.__PROD__
  ? '0zwHh3AUKrby6uIV2tKzArDXy243'
  : 'LmUG7m0hT1cfbnJiO0JvAJhdL5O2';

const getRandomTotp = () => Math.floor(Math.random() * 1000000).toString();

describe('Two Factor Auth Setup Flow', async () => {
  const caller = await getTrpcCaller();
  let secretKey: string | undefined;
  let otpAuthUrl: string | undefined;

  it('should have expected response', async () => {
    const output = await caller.twoFactorAuth.status(uid);
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });

  it('should create new totp for the first time', async () => {
    const output = await caller.twoFactorAuth.setup(uid);
    expect(output).toHaveProperty('secretKey');
    expect(output).toHaveProperty('otpAuthUrl');
    secretKey = output.secretKey;
    otpAuthUrl = output.otpAuthUrl;
  });

  it('should return already created totp if requested to setup again', async () => {
    const output = await caller.twoFactorAuth.setup(uid);
    expect(output).toStrictEqual({ secretKey, otpAuthUrl });
  });

  it('should still show totp not setup after setup step', async () => {
    const output = await caller.twoFactorAuth.status(uid);
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });

  it('should not verify if user enters wrong totp token', async () => {
    const output = await caller.twoFactorAuth.verify({
      uid,
      totp: getRandomTotp(),
    });
    expect(output).toStrictEqual({ isVerified: false });
  });

  it('should verify if user enters correct totp token', async () => {
    const correctToken = authenticator.generate(secretKey ?? '');
    const output = await caller.twoFactorAuth.verify({
      uid,
      totp: correctToken,
    });
    expect(output).toStrictEqual({ isVerified: true });
  });

  it('should show totp as setup after successfully verifying', async () => {
    const output = await caller.twoFactorAuth.status(uid);
    expect(output).toStrictEqual({ is2FAEnabled: true });
  });

  it('should not authenticate the user if wrong totp token is entered', async () => {
    const output = await caller.twoFactorAuth.authenticate({
      uid,
      totp: getRandomTotp(),
    });
    expect(output).toStrictEqual({ isVerified: false });
  });

  it('should authenticate the user if correct totp token is entered', async () => {
    const token = authenticator.generate(secretKey ?? '');
    const output = await caller.twoFactorAuth.authenticate({
      uid,
      totp: token,
    });
    expect(output).toStrictEqual({ isVerified: true });
  });

  it('should revoke the totp status', async () => {
    const output = await caller.twoFactorAuth.revoke(uid);
    expect(output).toStrictEqual({ isRevoked: true });
  });

  it('should show totp not setup after being revoked', async () => {
    const output = await caller.twoFactorAuth.status(uid);
    expect(output).toStrictEqual({ is2FAEnabled: false });
  });
});
