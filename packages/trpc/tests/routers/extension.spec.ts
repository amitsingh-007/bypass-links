import { describe, expect, it } from 'vitest';
import { getTrpcCaller } from '../test-helpers';

describe('extension router test', async () => {
  const caller = await getTrpcCaller();

  it('should have expected response', async () => {
    const output = await caller.extension.latest();
    expect(output).toHaveProperty('extension');
    expect(output).toHaveProperty('date');
    expect(output).toHaveProperty('version');
  });
});
