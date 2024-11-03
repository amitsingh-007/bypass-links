import { describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';

describe('extension router test', () => {
  const caller = getTrpcCaller();

  it('should have expected response', async () => {
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
