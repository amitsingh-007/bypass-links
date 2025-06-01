import { expect, type Page } from '@playwright/test';

export class DownloadPage {
  constructor(readonly page: Page) {}

  async testPageMetaData() {
    await expect(this.page).toHaveTitle('Skip Links, Ads, Timers & ReCaptchas');
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      'Have a Link Bypasser and private Bookmarks Panel !'
    );
  }
}
