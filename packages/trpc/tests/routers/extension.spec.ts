import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';
import { anonymousSignIn, deleteFirebaseUser, FirebaseUser } from '../firebase';

describe('extension router test', () => {
  let user: FirebaseUser;

  beforeAll(async () => {
    const userCredential = await anonymousSignIn();
    user = userCredential.user;
  });

  afterAll(async () => {
    await deleteFirebaseUser(user);
  });

  it('should have expected response', async () => {
    const caller = getTrpcCaller();
    const output = await caller.extension.latest();
    expect(output).toEqual(
      expect.objectContaining({
        chrome: {
          version: expect.any(String),
          date: expect.any(String),
          downloadLink: expect.any(String),
        },
        firefox: {
          version: expect.any(String),
          date: expect.any(String),
          downloadLink: expect.any(String),
        },
      })
    );
  });
});
