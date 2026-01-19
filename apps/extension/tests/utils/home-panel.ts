import { expect, type Page } from '@playwright/test';
import { TEST_TIMEOUTS } from '../constants';
import { getStorageItem, toggleSwitch } from './test-utils';

export class PopupHomePanel {
  constructor(readonly page: Page) {}

  get historyToggle() {
    return this.page.getByTestId('toggle-history-switch');
  }

  get historyLabel() {
    return this.page.locator('label').filter({ hasText: 'History' });
  }

  async isHistoryEnabled() {
    return this.historyToggle.isChecked();
  }

  async setHistoryEnabled(enabled: boolean) {
    const isChecked = await this.isHistoryEnabled();
    if (isChecked !== enabled) {
      await toggleSwitch(this.page, 'History');
    }
  }

  async navigateToBookmarks() {
    const bookmarksButton = this.page.getByRole('button', {
      name: 'Bookmarks',
    });
    await bookmarksButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async navigateToPersons() {
    const personsButton = this.page.getByRole('button', { name: 'Persons' });
    await personsButton.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.PAGE_LOAD);
  }

  async verifyHistoryStartTime() {
    const historyStartTime = await getStorageItem<string>(
      this.page,
      'historyStartTime'
    );
    expect(historyStartTime).toBeDefined();
    return historyStartTime;
  }

  async verifyHistoryStartTimeNotExists() {
    const historyStartTime = await getStorageItem<string>(
      this.page,
      'historyStartTime'
    );
    expect(historyStartTime).toBeUndefined();
  }
}
