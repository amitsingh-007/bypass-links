import { mock } from 'node:test';

import { expect, test } from '@playwright/test';

import useProgressStore from '@/store/progress';

test('new loading actions cancel older delayed progress resets', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { startLoading, stopLoading } = useProgressStore.getState();
  try {
    startLoading();
    stopLoading();
    mock.timers.tick(299);
    expect(useProgressStore.getState().isLoading).toBe(true);
    startLoading();
    mock.timers.tick(1);
    expect(useProgressStore.getState().isLoading).toBe(true);

    stopLoading();
    mock.timers.tick(200);
    stopLoading();
    mock.timers.tick(100);
    expect(useProgressStore.getState().isLoading).toBe(true);
    mock.timers.tick(200);
    expect(useProgressStore.getState().isLoading).toBe(false);
  } finally {
    mock.timers.reset();
    useProgressStore.setState({ isLoading: false });
  }
});
