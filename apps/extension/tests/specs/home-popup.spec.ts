import { expect, test } from '../fixtures/home-popup-fixture';

test.describe('Home Popup', () => {
  /**
   * One tree instead of eight assertions: every action gates its own `disabled`
   * on the auth state independently, so this is what catches one of them going
   * enabled while signed out.
   */
  test('load extension', async ({ unauthPage }) => {
    await expect(unauthPage.locator('body')).toMatchAriaSnapshot(`
      - text: Bypass Links
      - switch "Enable" [checked]
      - text: Enable
      - switch
      - text: History
      - button "Login"
      - button "Defaults" [disabled]
      - button "Shortcuts" [disabled]
      # Nested button: TooltipTrigger renders its own, and only the inner one is
      # disabled. A defect, recorded so fixing it shows up here.
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
