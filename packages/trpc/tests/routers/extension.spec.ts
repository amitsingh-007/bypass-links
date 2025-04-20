import { beforeAll, describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';
import { testUserSignIn } from '../firebase';

describe('extension router test', () => {
  beforeAll(async () => {
    await testUserSignIn();
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
