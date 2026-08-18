import { POPUP_HOMEPAGE } from '@/constants';

import { expect, test } from '../fixtures/extension-fixture';

test.describe('Home Popup', () => {
  /**
   * The signed-out shell is snapshotted rather than asserted button by button:
   * every action gates its own `disabled` on the auth state, so one tree is what
   * catches a control that stays enabled for a signed-out user.
   */
  test('load extension', async ({ page }) => {
    await page.goto(POPUP_HOMEPAGE);

    await expect(page.locator('body')).toMatchAriaSnapshot(`
      - text: Bypass Links
      - switch "Enable" [checked]
      - text: Enable
      - switch
      - text: History
      - button "Login"
      - button "Defaults" [disabled]
      - button "Shortcuts" [disabled]
      - button "Pin":
        - button "Pin" [disabled]
      - button "Persons" [disabled]
      - button "Bookmarks" [disabled]
      - button "Forum" [disabled]
      - button "Visited":
        - button "Visited" [disabled]
    `);
  });
});
