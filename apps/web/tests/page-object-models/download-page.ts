import { expect, Page } from '@playwright/test';

export class DownloadPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async testPageMetaData() {
    await expect(this.page).toHaveTitle('Skip Links, Ads, Timers & ReCaptchas');
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      'Have a Link Bypasser and private Bookmarks Panel !'
    );
  }
}
