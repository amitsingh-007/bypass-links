import { expect, type Page } from '@playwright/test';

import { EExtStorageKey } from '@/constants';

import { getStorageItem } from './test-utils';

export class PopupHomePanel {
  constructor(readonly page: Page) {}

  get historyToggle() {
    return this.page.getByTestId('toggle-history-switch');
  }

  async isHistoryEnabled() {
    return this.historyToggle.isChecked();
  }

  async setHistoryEnabled(enabled: boolean) {
    const isChecked = await this.isHistoryEnabled();
    if (isChecked !== enabled) {
      await this.historyToggle.click();
      await expect(this.historyToggle).toBeChecked({ checked: enabled });
    }
  }

  async navigateToBookmarks() {
    const bookmarksButton = this.page.getByRole('button', {
      name: 'Bookmarks',
    });
    await bookmarksButton.click();
    await expect(this.page.getByPlaceholder('Search')).toBeVisible();
  }

  async verifyHistoryStartTime() {
    const historyStartTime = await getStorageItem<number>(
      this.page,
      EExtStorageKey.HISTORY_START_TIME
    );
    expect(historyStartTime).toBeDefined();
    return historyStartTime;
  }

  async verifyHistoryStartTimeNotExists() {
    const historyStartTime = await getStorageItem<number>(
      this.page,
      EExtStorageKey.HISTORY_START_TIME
    );
    expect(historyStartTime).toBeUndefined();
  }
}
