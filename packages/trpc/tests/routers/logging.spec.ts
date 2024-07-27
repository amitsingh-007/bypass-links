import { describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';

describe('logging router test', () => {
  const caller = getTrpcCaller();

  it('should execute without errors', async () => {
    await expect(
      caller.logging.log({
        app: 'extension',
        isProd: false,
        level: 'error',
        url: 'https://www.example.com',
        message: 'Error 500',
      })
    ).resolves.not.toThrow();
  });
});
